import { hasKey } from "@utils/hasKey";
import type { Duplose, ExtractErrorFunction } from "./duplose";
import { Route } from "./duplose/route";
import { type DuploHooks, makeHooksInstanceLifeCycle, makeHooksRouteLifeCycle } from "./hook";
import { NotFoundHttpResponse, UnprocessableEntityHttpResponse } from "./response/simplePreset";
import { Router } from "./router";
import type { AnyFunction, PromiseOrNot } from "@utils/types";
import type { CurrentRequestObject } from "./request";
import type { Response } from "./response";
import { useRouteBuilder } from "./builder/route";
import type { GetPropsWithTrueValue } from "@utils/getPropsWithTrueValue";

export interface Environments {
	DEV: true;
	PROD: true;
	TEST: true;
}

export type Environment = GetPropsWithTrueValue<Environments>;

export interface DuploConfig {
	environment: Environment;
}

export type NotfoundHandler = (request: CurrentRequestObject) => Response;

export class Duplo {
	public duploses: Duplose[] = [];

	public hooksRouteLifeCycle = makeHooksRouteLifeCycle();

	public hooksInstanceLifeCycle = makeHooksInstanceLifeCycle();

	public constructor(
		public config: DuploConfig,
	) { }

	public extractError: ExtractErrorFunction = (type, key, error) => new UnprocessableEntityHttpResponse(`TYPE_ERROR.${type}${key ? `.${key}` : ""}`, error);

	public notfoundHandler: NotfoundHandler = () => new NotFoundHttpResponse("NOTFOUND", undefined);

	public setNotfoundHandler(notfoundHandler: Duplo["notfoundHandler"]) {
		this.notfoundHandler = notfoundHandler;

		return this;
	}

	public setExtractError(extractError: Duplo["extractError"]) {
		this.extractError = extractError;

		return this;
	}

	public hook<
		T extends keyof DuploHooks,
	>(hookName: T, subscriber: DuploHooks[T]) {
		if (hasKey(this.hooksRouteLifeCycle, hookName)) {
			this.hooksRouteLifeCycle[hookName].addSubscriber(subscriber as AnyFunction);
		} else if (hasKey(this.hooksInstanceLifeCycle, hookName)) {
			this.hooksInstanceLifeCycle[hookName].addSubscriber(subscriber as AnyFunction);
		}
		return this;
	}

	public register(duplose: Duplose) {
		duplose.instance = this;
		this.duploses.push(duplose);
		this.hooksInstanceLifeCycle.onRegistered.launchSubscriber(duplose);

		return this;
	}

	protected createNotfoundRoute() {
		const notfoundHandler = this.notfoundHandler;
		return useRouteBuilder(new Route("GET", ["/*"]))
			.handler((floor, request) => notfoundHandler(request));
	}

	public async start(onStart?: (duplo: Duplo) => PromiseOrNot<void>) {
		await this.hooksInstanceLifeCycle.beforeBuildRouter.launchSubscriber(this);

		const router = new Router(
			this.duploses.filter((duplose) => duplose instanceof Route),
			this.createNotfoundRoute(),
		);

		if (onStart) {
			this.hooksInstanceLifeCycle.onStart.addSubscriber(onStart);
		}
		await this.hooksInstanceLifeCycle.onStart.launchSubscriber(this);

		return router;
	}
}

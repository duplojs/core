import { hasKey } from "@utils/hasKey";
import type { Duplose, ExtractErrorFunction } from "./duplose";
import { Route } from "./duplose/route";
import { NotFoundHttpResponse, UnprocessableEntityHttpResponse } from "./response/simplePreset";
import type { AnyFunction } from "@utils/types";
import type { CurrentRequestObject } from "./request";
import type { Response } from "./response";
import { useRouteBuilder } from "./builder/route";
import type { GetPropsWithTrueValue } from "@utils/getPropsWithTrueValue";
import { type BuildedHooksInstanceLifeCycle, HooksInstanceifeCycle } from "./hook/instanceLifeCycle";
import { type BuildedHooksRouteLifeCycle, HooksRouteLifeCycle } from "./hook/routeLifeCycle";

export interface Environments {
	DEV: true;
	PROD: true;
	TEST: true;
}

export type Environment = GetPropsWithTrueValue<Environments>;

export interface DuploConfig {
	environment: Environment;
	disabledRuntimeEndPointCheck?: boolean;
	disabledZodAccelerator?: boolean;
}

export type NotfoundHandler = (request: CurrentRequestObject) => Response;

export type DuploHooks = BuildedHooksInstanceLifeCycle & BuildedHooksRouteLifeCycle;

export class Duplo {
	public duploses: Duplose[] = [];

	public hooksRouteLifeCycle = new HooksRouteLifeCycle<CurrentRequestObject>();

	public hooksInstanceLifeCycle = new HooksInstanceifeCycle();

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
		const route = new Route("GET", ["/*"]);
		this.register(route);
		return useRouteBuilder(route)
			.handler((floor, request) => notfoundHandler(request));
	}
}

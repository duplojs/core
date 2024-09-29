import { hasKey } from "@utils/hasKey";
import type { Duplose, ExtractErrorFunction } from "./duplose";
import { Route } from "./duplose/route";
import { NotFoundHttpResponse, UnprocessableEntityHttpResponse } from "./response/simplePreset";
import type { AnyFunction } from "@utils/types";
import type { CurrentRequestObject } from "./request";
import type { PresetGenericResponse } from "./response";
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

export type DuploPlugins = (instance: Duplo) => void;

export interface DuploConfig {
	environment: Environment;
	disabledRuntimeEndPointCheck?: boolean;
	disabledZodAccelerator?: boolean;
	keyToInformationInHeaders?: string;
	plugins?: DuploPlugins[];
}

export type NotfoundHandler = (request: CurrentRequestObject) => PresetGenericResponse;

export type DuploHooks = BuildedHooksInstanceLifeCycle & BuildedHooksRouteLifeCycle<CurrentRequestObject>;

export class Duplo {
	public duploses: Duplose[] = [];

	public hooksRouteLifeCycle = new HooksRouteLifeCycle<CurrentRequestObject>();

	public hooksInstanceLifeCycle = new HooksInstanceifeCycle();

	public constructor(
		public config: DuploConfig,
	) {
		config.plugins?.forEach((plugin) => void plugin(this));

		const keyToInformationInHeaders = config.keyToInformationInHeaders ?? "information";
		this.hooksRouteLifeCycle.beforeSend.addSubscriber(
			(request, response) => {
				if (response.information) {
					response.headers[keyToInformationInHeaders] = response.information;
				}
			},
		);
	}

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

	public register(...duplose: Duplose[]) {
		duplose.forEach(
			(duplose) => {
				duplose.instance = this;
				this.duploses.push(duplose);
				this.hooksInstanceLifeCycle.onRegistered.launchSubscriber(duplose);
			},
		);

		return this;
	}
}

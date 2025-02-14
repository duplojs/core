import type { Duplose, DuploseEvaler } from "./duplose";
import { NotFoundHttpResponse, UnprocessableEntityHttpResponse } from "./response/simplePreset";
import type { CurrentRequestObject } from "./request";
import type { PresetGenericResponse } from "./response";
import { type BuildedHooksInstanceLifeCycle, HooksInstanceifeCycle } from "./hook/instanceLifeCycle";
import { type BuildedHooksRouteLifeCycle, HooksRouteLifeCycle } from "./hook/routeLifeCycle";
import type { RecieveFormDataOptions } from "./parser";
import type { HookEvaler } from "./hook";
import type { BuildedRouter, RouterEvaler } from "./router";
import { makeHookInformation } from "./hook/default";
import type { ExtractErrorFunction } from "./step/extract";
import { type AnyFunction, type BytesInString, type GetPropsWithTrueValue, hasKey, type PartialKeys, type RequiredKeys, type SimplifyType, stringToBytes } from "@duplojs/utils";

export interface Environments {
	DEV: true;
	PROD: true;
	TEST: true;
}

export type Environment = GetPropsWithTrueValue<Environments>;

export type DuploPlugins = (instance: Duplo) => void;

export interface DuploConfig {
	environment: Environment;
	disabledRuntimeEndPointCheck: boolean;
	disabledZodAccelerator: boolean;
	keyToInformationInHeaders: string;
	plugins: DuploPlugins[];
	bodySizeLimit: number;
	recieveFormDataOptions: RequiredKeys<
		RecieveFormDataOptions,
		"prefixTempName" | "strict" | "uploadDirectory"
	>;
}

export type DuploInputConfig = SimplifyType<
	Omit<
		PartialKeys<
			DuploConfig,
			"disabledRuntimeEndPointCheck" | "disabledZodAccelerator" | "keyToInformationInHeaders" | "plugins"
		>,
		"bodySizeLimit" | "recieveFormDataOptions"
	> & {
		bodySizeLimit?: number | BytesInString;
		recieveFormDataOptions?: Partial<RecieveFormDataOptions>;
	}
>;

export type NotfoundHandler = (request: CurrentRequestObject) => PresetGenericResponse;

export type DuploHooks = BuildedHooksInstanceLifeCycle & BuildedHooksRouteLifeCycle<CurrentRequestObject>;

export interface Evalers {
	duplose?: DuploseEvaler;
	hook?: HookEvaler;
	router?: RouterEvaler;
}

export class Duplo<GenericDuploInputConfig extends DuploInputConfig = DuploInputConfig> {
	public config: DuploConfig;

	public duploses: Duplose[] = [];

	public hooksRouteLifeCycle = new HooksRouteLifeCycle<CurrentRequestObject>();

	public hooksInstanceLifeCycle = new HooksInstanceifeCycle();

	public buildedRouter?: BuildedRouter;

	public evalers: Evalers = {};

	public constructor(
		inputConfig: GenericDuploInputConfig,
	) {
		this.config = {
			...inputConfig,
			environment: inputConfig.environment,
			disabledRuntimeEndPointCheck: !!inputConfig.disabledRuntimeEndPointCheck,
			disabledZodAccelerator: !!inputConfig.disabledZodAccelerator,
			keyToInformationInHeaders: inputConfig.keyToInformationInHeaders ?? "information",
			plugins: inputConfig.plugins ?? [],
			bodySizeLimit: stringToBytes(inputConfig.bodySizeLimit ?? "50mb"),
			recieveFormDataOptions: {
				...inputConfig.recieveFormDataOptions,
				uploadDirectory: inputConfig.recieveFormDataOptions?.uploadDirectory ?? "upload",
				prefixTempName: inputConfig.recieveFormDataOptions?.prefixTempName ?? "tmp-",
				strict: !!inputConfig.recieveFormDataOptions?.strict,
			},
		};

		this.hooksRouteLifeCycle.beforeSend.addSubscriber(
			makeHookInformation(this.config.keyToInformationInHeaders),
		);

		this.config.plugins.forEach((plugin) => void plugin(this));
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

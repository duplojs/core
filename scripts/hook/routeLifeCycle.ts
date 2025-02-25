/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { CurrentRequestObject } from "@scripts/request";
import type { PresetGenericResponse } from "@scripts/response";
import { Hook, type BuildHooks } from ".";
import { HooksLifeCycle } from "./lifeCycle";
import { type MybePromise } from "@duplojs/utils";

export class HooksRouteLifeCycle <
	Request extends CurrentRequestObject = CurrentRequestObject,
> extends HooksLifeCycle {
	public beforeRouteExecution
		= new Hook<(request: Request) => MybePromise<boolean | PresetGenericResponse | void>>(1);

	public parsingBody
		= new Hook<(request: Request) => MybePromise<boolean | PresetGenericResponse | void>>(1);

	public onError
		= new Hook<(request: Request, error: unknown) => MybePromise<PresetGenericResponse | void>>(2);

	public beforeSend
		= new Hook<(request: Request, response: PresetGenericResponse) => MybePromise<boolean | void>>(2);

	public serializeBody
		= new Hook<(request: Request, response: PresetGenericResponse) => MybePromise<boolean | void>>(2);

	public afterSend
		= new Hook<(request: Request, response: PresetGenericResponse) => MybePromise<boolean | void>>(2);
}

export type BuildedHooksRouteLifeCycle<
	Request extends CurrentRequestObject = CurrentRequestObject,
> = Omit<
	BuildHooks<HooksRouteLifeCycle<Request>>,
	keyof HooksLifeCycle
>;

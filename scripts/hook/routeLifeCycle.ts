import type { CurrentRequestObject } from "@scripts/request";
import type { PresetGenericResponse } from "@scripts/response";
import type { PromiseOrNot } from "@utils/types";
import { Hook, type BuildHooks } from ".";
import { HooksLifeCycle } from "./lifeCycle";

export class HooksRouteLifeCycle <
	Request extends CurrentRequestObject = CurrentRequestObject,
> extends HooksLifeCycle {
	public beforeRouteExecution
		= new Hook<(request: Request) => PromiseOrNot<boolean | PresetGenericResponse | void>>(1);

	public parsingBody
		= new Hook<(request: Request) => PromiseOrNot<boolean | PresetGenericResponse | void>>(1);

	public onError
		= new Hook<(request: Request, error: unknown) => PromiseOrNot<PresetGenericResponse | void>>(2);

	public beforeSend
		= new Hook<(request: Request, response: PresetGenericResponse) => PromiseOrNot<boolean | void>>(2);

	public serializeBody
		= new Hook<(request: Request, response: PresetGenericResponse) => PromiseOrNot<boolean | void>>(2);

	public afterSend
		= new Hook<(request: Request, response: PresetGenericResponse) => PromiseOrNot<boolean | void>>(2);
}

export type BuildedHooksRouteLifeCycle<
	Request extends CurrentRequestObject = CurrentRequestObject,
> = Omit<
	BuildHooks<HooksRouteLifeCycle<Request>>,
	keyof HooksLifeCycle
>;

import type { CurrentRequestObject } from "@scripts/request";
import type { PresetGeneriqueResponse } from "@scripts/response";
import type { PromiseOrNot } from "@utils/types";
import { Hook, type BuildHooks } from ".";
import { HooksLifeCycle } from "./lifeCycle";

export class HooksRouteLifeCycle <
	Request extends CurrentRequestObject,
> extends HooksLifeCycle {
	public beforeRouteExecution
		= new Hook<(request: Request) => PromiseOrNot<boolean | PresetGeneriqueResponse | void>>(1);

	public parsingBody
		= new Hook<(request: Request) => PromiseOrNot<boolean | PresetGeneriqueResponse | void>>(1);

	public onError
		= new Hook<(request: Request, error: unknown) => PromiseOrNot<PresetGeneriqueResponse | void>>(2);

	public beforeSend
		= new Hook<(request: Request, response: PresetGeneriqueResponse) => PromiseOrNot<boolean | void>>(2);

	public serializeBody
		= new Hook<(request: Request, response: PresetGeneriqueResponse) => PromiseOrNot<boolean | void>>(2);

	public afterSend
		= new Hook<(request: Request, response: PresetGeneriqueResponse) => PromiseOrNot<boolean | void>>(2);
}

export type BuildedHooksRouteLifeCycle<
	Request extends CurrentRequestObject,
> = Omit<
	BuildHooks<HooksRouteLifeCycle<Request>>,
	keyof HooksLifeCycle
>;

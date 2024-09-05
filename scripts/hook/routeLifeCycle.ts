import type { CurrentRequestObject } from "@scripts/request";
import type { Response } from "@scripts/response";
import type { PromiseOrNot } from "@utils/types";
import { Hook, type BuildHooks } from ".";
import { HooksLifeCycle } from "./lifeCycle";

export class HooksRouteLifeCycle <
	Request extends CurrentRequestObject = any,
> extends HooksLifeCycle {
	public beforeRouteExecution = new Hook<(request: Request) => PromiseOrNot<boolean | Response | void>>(1);

	public parsingBody = new Hook<(request: Request) => PromiseOrNot<boolean | Response | void>>(1);

	public onError = new Hook<(request: Request, error: unknown) => PromiseOrNot<Response | void>>(2);

	public beforeSend = new Hook<(request: Request, response: Response) => PromiseOrNot<boolean | void>>(2);

	public serializeBody = new Hook<(request: Request, response: Response) => PromiseOrNot<boolean | void>>(2);

	public afterSend = new Hook<(request: Request, response: Response) => PromiseOrNot<boolean | void>>(2);
}

export type BuildedHooksRouteLifeCycle<
	Request extends CurrentRequestObject = any,
> = Omit<
	BuildHooks<HooksRouteLifeCycle<Request>>,
	keyof HooksLifeCycle
>;

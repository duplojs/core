import type { PromiseOrNot } from "@utils/types";
import { Step } from ".";
import type { Description } from "@scripts/description";
import type { CurrentRequestObject } from "@scripts/request";
import type { Response } from "@scripts/response";
import type { Floor } from "@scripts/floor";
import { BuildedHandlerStep } from "./builded/handler";

export type Handler<
	FloorData extends object = object,
	Request extends CurrentRequestObject = CurrentRequestObject,
	CurrentResponse extends Response = Response,
> = (floor: Floor<FloorData>, request: Request) => PromiseOrNot<NoInfer<CurrentResponse>>;

export class HandlerStep extends Step<Handler, -1> {
	public constructor(
		handlerFunction: Handler,
		descriptions: Description[] = [],
	) {
		super(handlerFunction, descriptions);
	}

	public build() {
		return new BuildedHandlerStep(this);
	}
}

import type { PromiseOrNot } from "@utils/types";
import { Step } from ".";
import type { Description } from "@scripts/description";
import type { CurrentRequestObject } from "@scripts/request";
import type { ContractResponse, Response } from "@scripts/response";
import type { Floor } from "@scripts/floor";
import { BuildedHandlerStep } from "./builded/handler";
import { type Duplo } from "@scripts/duplo";

export type Handler<
	FloorData extends object = object,
	Request extends CurrentRequestObject = CurrentRequestObject,
	CurrentResponse extends Response = Response,
> = (floor: Floor<FloorData>, request: Request) => PromiseOrNot<NoInfer<CurrentResponse>>;

export class HandlerStep<
	R extends ContractResponse = ContractResponse,
	_StepNumber extends number = number,
> extends Step<Handler, -1> {
	public responses: R[];

	public constructor(
		handlerFunction: Handler,
		responses: R[] = [],
		descriptions: Description[] = [],
	) {
		super(handlerFunction, descriptions);
		this.responses = responses;
	}

	public build(instance: Duplo) {
		return new BuildedHandlerStep(instance, this);
	}
}

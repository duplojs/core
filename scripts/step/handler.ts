import type { PromiseOrNot } from "@utils/types";
import { StepWithResponse } from ".";
import type { Description } from "@scripts/description";
import type { CurrentRequestObject } from "@scripts/request";
import type { ContractResponse, PresetGenericResponse } from "@scripts/response";
import type { Floor } from "@scripts/floor";
import { BuildedHandlerStep } from "./builded/handler";
import { type Duplo } from "@scripts/duplo";

export type Handler<
	FloorData extends object = object,
	Request extends CurrentRequestObject = CurrentRequestObject,
	CurrentResponse extends PresetGenericResponse = PresetGenericResponse,
> = (pickup: Floor<FloorData>["pickup"], request: Request) => PromiseOrNot<NoInfer<CurrentResponse>>;

export class HandlerStep<
	R extends ContractResponse = ContractResponse,
	_StepNumber extends number = number,
> extends StepWithResponse<Handler, R, -1> {
	public constructor(
		handlerFunction: Handler,
		responses: R[] = [],
		descriptions: Description[] = [],
	) {
		super(handlerFunction, responses, descriptions);
	}

	public build(instance: Duplo) {
		return new BuildedHandlerStep(instance, this);
	}
}

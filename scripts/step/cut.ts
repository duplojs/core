import { StepWithResponse } from ".";
import type { Description } from "@scripts/description";
import { BuildedCutStep } from "./builded/cut";
import type { ContractResponse, PresetGenericResponse } from "@scripts/response";
import { type Duplo } from "@scripts/duplo";
import type { DroppedValue, Floor } from "@scripts/floor";
import type { CurrentRequestObject } from "@scripts/request";
import { type MybePromise } from "@duplojs/utils";

export type CutReturnValue = DroppedValue | PresetGenericResponse;

export type Cut<
	FloorData extends object = object,
	Request extends CurrentRequestObject = CurrentRequestObject,
	ReturnValue extends CutReturnValue = CutReturnValue,
> = (floor: Omit<Floor<FloorData>, "drop">, request: Request) => MybePromise<ReturnValue>;

export class CutStep<
	R extends ContractResponse = ContractResponse,
	_StepNumber extends number = number,
> extends StepWithResponse<Cut, R, _StepNumber> {
	public drop: string[];

	public constructor(
		cutFunction: Cut,
		drop: string[],
		responses: R[] = [],
		descriptions: Description[] = [],
	) {
		super(cutFunction, responses, descriptions);
		this.drop = drop;
	}

	public build(instance: Duplo) {
		return Promise.resolve(new BuildedCutStep(instance, this));
	}
}

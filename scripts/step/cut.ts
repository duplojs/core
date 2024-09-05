import type { PromiseOrNot } from "@utils/types";
import { Step } from ".";
import type { Description } from "@scripts/description";
import { BuildedCutStep } from "./builded/cut";
import type { CurrentRequestObject } from "@scripts/request";
import type { ContractResponse, Response } from "@scripts/response";
import type { Floor } from "@scripts/floor";
import { type Duplo } from "@scripts/duplo";

export type Cut<
	FloorData extends object = object,
	Request extends CurrentRequestObject = CurrentRequestObject,
	ReturnValue extends Record<string, unknown> | Response = Record<string, unknown> | Response,
> = (floor: Floor<FloorData>, request: Request) => PromiseOrNot<ReturnValue>;

export class CutStep<
	R extends ContractResponse = ContractResponse,
	_StepNumber extends number = number,
> extends Step<Cut, _StepNumber> {
	public drop: string[];

	public responses: R[];

	public constructor(
		cutFunction: Cut,
		drop: string[],
		responses: R[] = [],
		descriptions: Description[] = [],
	) {
		super(cutFunction, descriptions);
		this.drop = drop;
		this.responses = responses;
	}

	public build(instance: Duplo) {
		return new BuildedCutStep(instance, this);
	}
}

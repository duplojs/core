import type { PromiseOrNot } from "@utils/types";
import { Step } from ".";
import type { Description } from "@scripts/description";
import { BuildedCutStep } from "./builded/cut";
import type { CurrentRequestObject } from "@scripts/request";
import type { Response } from "@scripts/response";
import type { Floor } from "@scripts/floor";

export type Cut<
	FloorData extends object = object,
	Request extends CurrentRequestObject = CurrentRequestObject,
	ReturnValue extends Record<string, unknown> | Response = Record<string, unknown> | Response,
> = (floor: Floor<FloorData>, request: Request) => PromiseOrNot<ReturnValue>;

export class CutStep<
	CatchResponse extends Response = Response,
	_StepNumber extends number = number,
> extends Step<Cut, _StepNumber> {
	public drop: string[];

	public responses: CatchResponse[];

	public constructor(
		cutFunction: Cut,
		drop: string[],
		responses: CatchResponse[] = [],
		descriptions: Description[] = [],
	) {
		super(cutFunction, descriptions);
		this.drop = drop;
		this.responses = responses;
	}

	public build() {
		return new BuildedCutStep(this);
	}
}

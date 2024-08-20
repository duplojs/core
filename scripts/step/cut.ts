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
	CurrentResponse extends Response = Response,
	ReturnValue extends object = object,
> = (floor: Floor<FloorData>, request: Request) => PromiseOrNot<NoInfer<CurrentResponse> | ReturnValue>;

export class CutStep extends Step<Cut, -1> {
	public drop: string[];

	public constructor(
		cutFunction: Cut,
		drop: string[] = [],
		descriptions: Description[] = [],
	) {
		super(cutFunction, descriptions);
		this.drop = drop;
	}

	public build() {
		return new BuildedCutStep(this);
	}
}

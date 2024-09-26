import type { Description } from "@scripts/description";
import type { BuildedStep, BuildedStepWithResponses } from "./builded";
import { type Duplo } from "@scripts/duplo";
import type { ContractResponse } from "@scripts/response";

export abstract class Step<
	Parent extends any = any,
	_StepNumber extends number = number,
> {
	public constructor(
		public parent: Parent,
		public descriptions: Description[] = [],
	) {}

	public abstract build(instance: Duplo): BuildedStep;
}

export abstract class StepWithResponse<
	Parent extends any = any,
	R extends ContractResponse = ContractResponse,
	_StepNumber extends number = number,
> extends Step<Parent, _StepNumber> {
	public constructor(
		parent: Parent,
		public responses: R[] = [],
		descriptions: Description[] = [],
	) {
		super(parent, descriptions);
	}

	public abstract build(instance: Duplo): BuildedStepWithResponses;
}

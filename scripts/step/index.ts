import type { Description } from "@scripts/description";
import type { BuildedStep } from "./builded";
import { type Duplo } from "@scripts/duplo";

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

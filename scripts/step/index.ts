import type { Description } from "@scripts/description";
import type { BuildedStep } from "./builded";

export abstract class Step<Parent extends any = any> {
	public constructor(
		public parent: Parent,
		public descriptions: Description[] = [],
	) {}

	public abstract build(): BuildedStep;
}

import type { Description } from "@scripts/description";

export abstract class Step<Parent extends any = any> {
	public constructor(
		public parent: Parent,
		public descriptions: Description[] = [],
	) {}

	public abstract toString(): string;
}

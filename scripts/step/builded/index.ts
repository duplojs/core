import type { Step } from "..";

export abstract class BuildedStep<T extends Step = Step> {
	public constructor(
		public step: T,
	) {}

	public abstract toString(index: number): string;
}

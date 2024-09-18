import type { Duplo } from "@scripts/duplo";
import type { Step } from "..";

export abstract class BuildedStep<T extends Step = Step> {
	public constructor(
		public instance: Duplo,
		public step: T,
	) {}

	public abstract toString(index: number): string;
}

import type { Duplose } from "@scripts/duplose";

export class LastStepMustBeHandlerError extends Error {
	public constructor(
		public duplose: Duplose,
	) {
		super("The last step must be a handler step.");
	}
}

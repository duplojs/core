import type { Checker } from "@scripts/checker";

export class MissingHandlerCheckerError extends Error {
	public constructor(
		public checker: Checker,
	) {
		super("Missing handler in this checker.");
	}
}

import type { Duplose } from "@scripts/duplose";

export class BuildNoRegisteredDuploseError extends Error {
	public constructor(
		public duplose: Duplose,
	) {
		super("You must register duplose before build them.");
	}
}

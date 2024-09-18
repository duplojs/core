import type { Duplose } from "@scripts/duplose";

export class InjectBlockNotfoundError extends Error {
	public constructor(
		public blockName: string,
		public duplose: Duplose,
	) {
		super(`Inject block '${blockName}' not found in this duplose.`);
	}
}

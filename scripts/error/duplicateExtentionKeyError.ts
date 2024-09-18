import type { Duplose } from "@scripts/duplose";
import type { ObjectKey } from "@utils/types";

export class DuplicateExtentionkeyError extends Error {
	public constructor(
		public duplicateKey: ObjectKey,
		public duplose: Duplose,
	) {
		super(`The key '${duplicateKey.toString()}' is already use in this duplose.`);
	}
}

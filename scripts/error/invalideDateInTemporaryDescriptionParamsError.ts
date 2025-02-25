import { type TemporaryDescription } from "@scripts/description/temporary";

export class InvalideDateInTemporaryDescriptionParamsError extends Error {
	public constructor(
		public temporaryDescription: TemporaryDescription,
	) {
		super("A date used in temporary Description parameters is invalid.");
	}
}

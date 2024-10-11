export class NeedOverrideError extends Error {
	public constructor() {
		super("Missing override from porting module.");
	}
}

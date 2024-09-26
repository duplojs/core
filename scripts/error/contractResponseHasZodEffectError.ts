export class ContractResponseHasZodEffectError extends Error {
	public constructor() {
		super("A response contract schema uses a ZodEffect, please do not use 'transform', 'refine', 'superRefine', 'presetCheck' or 'preprocess' for an end point.");
	}
}

export class ResultIsNotAResponse extends Error {
	public constructor(
		public expectedResult: unknown,
	) {
		super("The expected result is not instance of Reponse");
	}
}
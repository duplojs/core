import { InvalideDateInTemporaryDescriptionParamsError } from "./invalideDateInTemporaryDescriptionParamsError";

it("InvalideDateInTemporaryDescriptionParamsError", () => {
	const error = new InvalideDateInTemporaryDescriptionParamsError({} as never);

	expect(error).instanceOf(Error);
});

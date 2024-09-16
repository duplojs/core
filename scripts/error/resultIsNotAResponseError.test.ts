import { ResultIsNotAResponseError } from "./resultIsNotAResponseError";

it("ResultIsNotAResponseError", () => {
	const error = new ResultIsNotAResponseError("toto");

	expect(error).instanceOf(Error);
	expect(error.expectedResult).toBe("toto");
});

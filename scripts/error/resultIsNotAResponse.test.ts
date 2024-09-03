import { ResultIsNotAResponse } from "./resultIsNotAResponse";

it("ResultIsNotAResponse", () => {
	const error = new ResultIsNotAResponse("toto");

	expect(error).instanceOf(Error);
	expect(error.expectedResult).toBe("toto");
});

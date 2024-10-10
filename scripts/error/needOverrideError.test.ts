import { NeedOverrideError } from "./needOverrideError";

it("NeedOverrideError", () => {
	const error = new NeedOverrideError();

	expect(error).instanceOf(Error);
});

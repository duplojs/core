import { booleanInString } from "./booleanInString";

it("boolean in string", () => {
	const zodSchema = booleanInString();

	expect(zodSchema.parse("true")).toBe(true);
	expect(zodSchema.parse("false")).toBe(false);
});

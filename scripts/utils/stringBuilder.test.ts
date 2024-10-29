import { checkResult, condition, insertBlock, mapped, maybeAwait, skipPreflight, skipStep, spread } from "./stringBuilder";

describe("stringBuilder", () => {
	it("mapped", () => {
		expect(mapped(["toto", "tata"], (value) => value)).toBe("toto\ntata");
	});

	it("spread", () => {
		expect(spread("toto", undefined, "tata", null)).toBe("toto\ntata");
	});

	it("condition", () => {
		expect(condition(true, () => "toto")).toBe("toto");

		expect(condition(false, () => "toto")).toBe("");
	});

	it("condition", () => {
		expect(condition(true, () => "toto")).toBe("toto");

		expect(insertBlock("toto")).toBe("\n/* toto */\n/* end_block */\n");
	});

	it("checkResult", () => {
		expect(checkResult("toto")).toBe("if(result instanceof this.Response){\ntoto\nbreak Execution;\n}");
	});

	it("maybeAwait", () => {
		expect(maybeAwait(true)).toBe("await ");

		expect(maybeAwait(false)).toBe("");
	});

	it("skipStep", () => {
		expect(skipStep(true, 1, "")).toMatchSnapshot();

		expect(skipStep(false, 1, "")).toBe("");
	});

	it("skipPreflight", () => {
		expect(skipPreflight(true, 1, "")).toMatchSnapshot();

		expect(skipPreflight(false, 1, "")).toBe("");
	});
});

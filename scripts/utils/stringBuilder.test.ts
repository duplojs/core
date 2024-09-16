import { checkResult, condition, extractLevelOne, extractLevelTwo, extractPart, insertBlock, mapped, maybeAwait, skipStep, spread } from "./stringBuilder";
import { zod } from "..";

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

	it("skipStep", async() => {
		await expect(skipStep(true, 1, "")).toMatchFileSnapshot("__data__/skipStep.txt");

		expect(skipStep(false, 1, "")).toBe("");
	});

	it("extractLevelOne", async() => {
		await expect(extractLevelOne("body", true)).toMatchFileSnapshot("__data__/extractLevelOne.txt");
	});

	it("extractLevelTwo", async() => {
		await expect(extractLevelTwo("params", "userId", false)).toMatchFileSnapshot("__data__/extractLevelTwo.txt");
	});

	it("extractPart", async() => {
		await expect(
			extractPart({
				body: zod.string(),
				params: { userId: zod.string() },
			}),
		).toMatchFileSnapshot("__data__/extractPart.txt");
	});
});

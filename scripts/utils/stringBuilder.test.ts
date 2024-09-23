import { checkResult, condition, extractLevelOne, extractLevelOnePresetCheck, extractLevelTwo, extractLevelTwoPresetCheck, extractPart, insertBlock, mapped, maybeAwait, skipStep, spread } from "./stringBuilder";
import { zod } from "..";
import { manualPresetChecker } from "@test/utils/manualDuplose";

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
		await expect(extractLevelOne("body", false)).toMatchFileSnapshot("__data__/extractLevelOne.txt");

		await expect(extractLevelOne("body", true)).toMatchFileSnapshot("__data__/extractLevelOneAcync.txt");
	});

	it("extractLevelTwo", async() => {
		await expect(extractLevelTwo("params", "userId", false)).toMatchFileSnapshot("__data__/extractLevelTwo.txt");

		await expect(extractLevelTwo("params", "userId", true)).toMatchFileSnapshot("__data__/extractLevelTwoAsync.txt");
	});

	it("extractLevelOnePresetCheck", async() => {
		await expect(extractLevelOnePresetCheck("body", undefined)).toMatchFileSnapshot("__data__/extractLevelOnePresetCheck.txt");

		await expect(extractLevelOnePresetCheck("body", "user")).toMatchFileSnapshot("__data__/extractLevelOnePresetCheckWithIndexing.txt");
	});

	it("extractLevelTwoPresetCheck", async() => {
		await expect(extractLevelTwoPresetCheck("params", "userId", undefined)).toMatchFileSnapshot("__data__/extractLevelTwoPresetCheck.txt");

		await expect(extractLevelTwoPresetCheck("params", "userId", "user")).toMatchFileSnapshot("__data__/extractLevelTwoPresetCheckWithIndexing.txt");
	});

	it("extractPart", async() => {
		await expect(
			extractPart({
				body: zod.string(),
				params: { userId: zod.string() },
			}),
		).toMatchFileSnapshot("__data__/extractPart.txt");

		await expect(
			extractPart({
				body: zod.string().presetCheck(manualPresetChecker),
				params: { userId: zod.string().presetCheck(manualPresetChecker) },
			}),
		).toMatchFileSnapshot("__data__/extractPartWithPreset.txt");
	});
});

import { writeFile, readFile } from "fs/promises";
import { checkResult, condition, extractLevelOne, extractLevelTwo, extractPart, insertBlock, mapped, maybeAwait, skipStep, spread } from "./stringBuilder";
import { resolve } from "path";
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
		expect(checkResult()).toBe("if(result instanceof this.Response){\nbreak Execution;\n}");
	});

	it("maybeAwait", () => {
		expect(maybeAwait(true)).toBe("await ");

		expect(maybeAwait(false)).toBe("");
	});

	it("skipStep", async() => {
		expect(skipStep(true, 1, "")).toBe(
			await readFile(resolve(import.meta.dirname, "__data__/skipStep.txt"), "utf-8"),
		);

		expect(skipStep(false, 1, "")).toBe("");
	});

	it("extractLevelOne", async() => {
		expect(extractLevelOne("body")).toBe(
			await readFile(resolve(import.meta.dirname, "__data__/extractLevelOne.txt"), "utf-8"),
		);
	});

	it("extractLevelTwo", async() => {
		expect(extractLevelTwo("params", "userId")).toBe(
			await readFile(resolve(import.meta.dirname, "__data__/extractLevelTwo.txt"), "utf-8"),
		);
	});

	it("extractPart", async() => {
		expect(
			extractPart({
				body: zod.string(),
				params: { userId: zod.string() },
			}),
		).toBe(
			await readFile(resolve(import.meta.dirname, "__data__/extractPart.txt"), "utf-8"),
		);
	});
});

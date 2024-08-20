import { advancedEval } from "@utils/advancedEval";
import { readFile, writeFile } from "fs/promises";
import { Process } from "./process";
import { resolve } from "path";
import { Duplo } from "@scripts/duplo";
import { BuildNoRegisteredDuploseError, CutStep, zod } from "..";
import type { Mock } from "vitest";
import { Request } from "@scripts/request";
import { PreflightStep } from "@scripts/step/preflight";

vi.mock("@utils/advancedEval", async(original) => ({
	advancedEval: vi.fn(),
	advancedEvalOriginal: (await original<{ advancedEval: unknown }>()).advancedEval,
}));

describe("Process", async() => {
	const duplo = new Duplo();
	const process = new Process("test");
	process.setExtract({
		params: { userId: zod.coerce.number() },
	});
	const step = new CutStep(() => ({ toto: "true" }), ["toto"]);
	process.addStep(step);
	const preflightProcess = new Process("preflightProcess");
	preflightProcess.instance = duplo;
	const preflight = new PreflightStep(preflightProcess, { pickup: ["flute"] });
	process.addPreflight(preflight);

	const spy = advancedEval as Mock;
	const { advancedEvalOriginal } = (await import("@utils/advancedEval")) as any as { advancedEvalOriginal: typeof advancedEval };

	it("name", () => {
		expect(process.name).toBe("test");
	});

	it("setInput", () => {
		process.setInput(1);

		expect(process.input).toBe(1);
	});

	it("setOptions", () => {
		const options = {};
		process.setOptions(options);

		expect(process.options).toBe(options);
	});

	it("setDrop", () => {
		const drop: string[] = ["toto", "userId"];
		process.setDrop(drop);

		expect(process.drop).toBe(drop);
	});

	it("build", async() => {
		expect(() => process.build()).toThrowError(BuildNoRegisteredDuploseError);

		process.instance = duplo;

		spy.mockImplementation(async(arg) => {
			expect(arg.content).toBe(
				await readFile(resolve(import.meta.dirname, "__data__/process.txt"), "utf-8"),
			);
		});

		await Promise.resolve(process.build());

		spy.mockImplementation(advancedEvalOriginal);

		const processFunction = process.build();

		expect(processFunction(new Request({ params: { userId: "2" } } as any))).toStrictEqual({
			toto: "true",
			userId: 2,
		});
	});
});

import { Process } from "@scripts/duplose/process";
import { ProcessStep, type ProcessStepParams } from "../process";
import { BuildedProcessStep } from "./process";
import { Duplo } from "@scripts/duplo";
import { makeFloor } from "@scripts/floor";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { duploTest } from "@test/utils/duploTest";

describe("BuildedProcessStep", () => {
	const process = new Process("test");
	process.instance = duploTest;
	process.setOptions({
		toto: 1,
		test: "",
	});
	process.setInput(22);

	it("merge object options", () => {
		const params: ProcessStepParams = {
			options: {
				toto: 2,
				test1: "&",
			},
		};

		const step = new ProcessStep(process, params);

		const buildedProcessStep = new BuildedProcessStep(duploTest, step);

		expect(buildedProcessStep.params.options).toStrictEqual({
			toto: 2,
			test: "",
			test1: "&",
		});

		expect(buildedProcessStep.params.input?.(makeFloor().pickup)).toBe(22);
	});

	it("merge function options", () => {
		const params: ProcessStepParams = {
			options: () => ({
				toto: 2,
				test1: "&",
			}),
		};

		const step = new ProcessStep(process, params);

		const buildedProcessStep = new BuildedProcessStep(duploTest, step);

		expect(
			typeof buildedProcessStep.params.options === "function"
				? buildedProcessStep.params.options(makeFloor().pickup)
				: undefined,
		).toStrictEqual({
			toto: 2,
			test: "",
			test1: "&",
		});
	});

	it("toString options: function, pickup", async() => {
		const params: ProcessStepParams = {
			pickup: ["rr", "tt"],
			options: () => ({
				toto: 2,
				test1: "&",
			}),
		};

		const step = new ProcessStep(process, params);

		const buildedProcessStep = new BuildedProcessStep(duploTest, step);

		expect(buildedProcessStep.toString(1)).toBe(
			await readFile(resolve(import.meta.dirname, "__data__/process1.txt"), "utf-8"),
		);
	});

	it("toString options: object, input, skip", async() => {
		const params: ProcessStepParams = {
			input: () => undefined,
			options: {
				toto: 2,
				test1: "&",
			},
			skip: () => true,
		};

		const step = new ProcessStep(process, params);

		const buildedProcessStep = new BuildedProcessStep(duploTest, step);

		expect(buildedProcessStep.toString(1)).toBe(
			await readFile(resolve(import.meta.dirname, "__data__/process2.txt"), "utf-8"),
		);
	});
});

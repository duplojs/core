import { Process } from "@scripts/duplose/process";
import { ProcessStep, type ProcessStepParams } from "../process";
import { BuildedProcessStep } from "./process";
import { Duplo } from "@scripts/duplo";
import { makeFloor } from "@scripts/floor";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

describe("BuildedProcessStep", () => {
	const instance = new Duplo();
	const process = new Process("test");
	process.instance = instance;
	process.setOptions({
		toto: 1,
		test: "",
	});

	it("merge object options", () => {
		const params: ProcessStepParams = {
			options: {
				toto: 2,
				test1: "&",
			},
		};

		const step = new ProcessStep(process, params);

		const bildedProcessStep = new BuildedProcessStep(step);

		expect(bildedProcessStep.params.options).toStrictEqual({
			toto: 2,
			test: "",
			test1: "&",
		});
	});

	it("merge function options", () => {
		const params: ProcessStepParams = {
			options: () => ({
				toto: 2,
				test1: "&",
			}),
		};

		const step = new ProcessStep(process, params);

		const bildedProcessStep = new BuildedProcessStep(step);

		expect(
			typeof bildedProcessStep.params.options === "function"
				? bildedProcessStep.params.options(makeFloor().pickup)
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

		const bildedProcessStep = new BuildedProcessStep(step);

		expect(bildedProcessStep.toString(1)).toBe(
			await readFile(resolve(import.meta.dirname, "__data__/process1.txt"), "utf-8"),
		);
	});

	it("toString options: object, input", async() => {
		const params: ProcessStepParams = {
			input: () => undefined,
			options: {
				toto: 2,
				test1: "&",
			},
		};

		const step = new ProcessStep(process, params);

		const bildedProcessStep = new BuildedProcessStep(step);

		expect(bildedProcessStep.toString(1)).toBe(
			await readFile(resolve(import.meta.dirname, "__data__/process2.txt"), "utf-8"),
		);
	});
});

import { Process } from "@scripts/duplose/process";
import { type ProcessStepParams } from "../process";
import { Duplo } from "@scripts/duplo";
import { makeFloor } from "@scripts/floor";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { BuildedPreflightStep } from "./preflight";
import { PreflightStep } from "../preflight";

describe("BuildedPreflightStep", () => {
	const instance = new Duplo();
	const process = new Process("test");
	process.instance = instance;
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

		const step = new PreflightStep(process, params);

		const buildedProcessStep = new BuildedPreflightStep(step);

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

		const step = new PreflightStep(process, params);

		const buildedProcessStep = new BuildedPreflightStep(step);

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

		const step = new PreflightStep(process, params);

		const buildedProcessStep = new BuildedPreflightStep(step);

		expect(buildedProcessStep.toString(1)).toBe(
			await readFile(resolve(import.meta.dirname, "__data__/preflight1.txt"), "utf-8"),
		);
	});

	it("toString options: object, input, skip", async() => {
		const params: ProcessStepParams = {
			input: () => undefined,
			options: {
				toto: 2,
				test1: "&",
			},
		};

		const step = new PreflightStep(process, params);

		const buildedProcessStep = new BuildedPreflightStep(step);

		expect(buildedProcessStep.toString(1)).toBe(
			await readFile(resolve(import.meta.dirname, "__data__/preflight2.txt"), "utf-8"),
		);
	});
});

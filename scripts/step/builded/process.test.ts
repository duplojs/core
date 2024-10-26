import { Process } from "@scripts/duplose/process";
import { ProcessStep, type ProcessStepParams } from "../process";
import { BuildedProcessStep } from "./process";
import { makeFloor } from "@scripts/floor";
import { duploTest } from "@test/utils/duploTest";

describe("BuildedProcessStep", () => {
	const process = new Process("test");
	process.instance = duploTest;
	process.setOptions({
		toto: 1,
		test: "",
	});
	process.setInput(22);

	it("merge object options", async() => {
		const params: ProcessStepParams = {
			options: {
				toto: 2,
				test1: "&",
			},
		};

		const step = new ProcessStep(process, params);

		const buildedProcessStep = new BuildedProcessStep(duploTest, step, await process.build());

		expect(buildedProcessStep.params.options).toStrictEqual({
			toto: 2,
			test: "",
			test1: "&",
		});

		expect(buildedProcessStep.params.input?.(makeFloor().pickup)).toBe(22);
	});

	it("merge function options", async() => {
		const params: ProcessStepParams = {
			options: () => ({
				toto: 2,
				test1: "&",
			}),
		};

		const step = new ProcessStep(process, params);

		const buildedProcessStep = new BuildedProcessStep(duploTest, step, await process.build());

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

		const buildedProcessStep = new BuildedProcessStep(duploTest, step, await process.build());

		expect(buildedProcessStep.toString(1)).toMatchSnapshot();
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

		const buildedProcessStep = new BuildedProcessStep(duploTest, step, await process.build());

		expect(buildedProcessStep.toString(1)).toMatchSnapshot();
	});
});

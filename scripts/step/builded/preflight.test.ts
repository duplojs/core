import { Process } from "@scripts/duplose/process";
import { type ProcessStepParams } from "../process";
import { makeFloor } from "@scripts/floor";
import { BuildedPreflightStep } from "./preflight";
import { PreflightStep } from "../preflight";
import { duploTest } from "@test/utils/duploTest";

describe("BuildedPreflightStep", () => {
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

		const step = new PreflightStep(process, params);

		const buildedProcessStep = new BuildedPreflightStep(duploTest, step, await process.build());

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

		const step = new PreflightStep(process, params);

		const buildedProcessStep = new BuildedPreflightStep(duploTest, step, await process.build());

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

		const buildedProcessStep = new BuildedPreflightStep(duploTest, step, await process.build());

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

		const step = new PreflightStep(process, params);

		const buildedProcessStep = new BuildedPreflightStep(duploTest, step, await process.build());

		expect(buildedProcessStep.toString(1)).toMatchSnapshot();
	});
});

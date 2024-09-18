import { duploTest } from "@test/utils/duploTest";
import { BuildedProcessStep, Process, PreflightStep, type ProcessStepParams } from "..";

it("PreflightStep", () => {
	const process = new Process("test");
	process.instance = duploTest;

	const params: ProcessStepParams = {};

	const step = new PreflightStep(process, params);

	expect(step.parent).toBe(process);

	expect(step.params).toBe(params);

	expect(step.build(duploTest)).instanceOf(BuildedProcessStep);
});

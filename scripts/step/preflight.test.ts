import { duploTest } from "@test/utils/duploTest";
import { BuildedProcessStep, Process, PreflightStep, type ProcessStepParams } from "..";
import { createProcessDefinition } from "@test/utils/manualDuplose";

it("PreflightStep", async() => {
	const process = new Process(createProcessDefinition());
	process.instance = duploTest;

	const params: ProcessStepParams = {};

	const step = new PreflightStep(process, params);

	expect(step.parent).toBe(process);

	expect(step.params).toBe(params);

	expect(await step.build(duploTest)).instanceOf(BuildedProcessStep);
});

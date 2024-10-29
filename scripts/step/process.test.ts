import { duploTest } from "@test/utils/duploTest";
import { BuildedProcessStep, Process, ProcessStep, type ProcessStepParams } from "..";
import { createProcessDefinition } from "@test/utils/manualDuplose";

it("ProcessStep", async() => {
	const process = new Process(createProcessDefinition());
	process.instance = duploTest;

	const params: ProcessStepParams = {};

	const step = new ProcessStep(process, params);

	expect(step.parent).toBe(process);

	expect(step.params).toBe(params);

	expect(await step.build(duploTest)).instanceOf(BuildedProcessStep);
});

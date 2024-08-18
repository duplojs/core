import { BuildedProcessStep, Duplo, Process, ProcessStep, type ProcessStepParams } from "..";

it("ProcessStep", () => {
	const instance = new Duplo();

	const process = new Process("test");
	process.instance = instance;

	const params: ProcessStepParams = {};

	const step = new ProcessStep(process, params);

	expect(step.parent).toBe(process);

	expect(step.params).toBe(params);

	expect(step.build()).instanceOf(BuildedProcessStep);
});

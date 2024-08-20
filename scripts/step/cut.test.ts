import { BuildedCutStep, CutStep } from "..";

it("CutStep", () => {
	const cutFunction = () => ({});

	const step = new CutStep(cutFunction, ["test"]);

	expect(step.parent).toBe(cutFunction);

	expect(step.drop).toStrictEqual(["test"]);

	expect(step.build()).instanceOf(BuildedCutStep);
});

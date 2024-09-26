import { duploTest } from "@test/utils/duploTest";
import { BuildedCutStep, type Cut, CutStep } from "..";

it("CutStep", () => {
	const cutFunction: Cut = ({ dropper }) => dropper({});

	const step = new CutStep(cutFunction, ["test"]);

	expect(step.parent).toBe(cutFunction);

	expect(step.drop).toStrictEqual(["test"]);

	expect(step.build(duploTest)).instanceOf(BuildedCutStep);
});

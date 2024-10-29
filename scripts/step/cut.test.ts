import { duploTest } from "@test/utils/duploTest";
import { BuildedCutStep, type Cut, CutStep } from "..";

it("CutStep", async() => {
	const cutFunction: Cut = ({ dropper }) => dropper(null);

	const step = new CutStep(cutFunction, ["test"]);

	expect(step.parent).toBe(cutFunction);

	expect(step.drop).toStrictEqual(["test"]);

	expect(await step.build(duploTest)).instanceOf(BuildedCutStep);
});

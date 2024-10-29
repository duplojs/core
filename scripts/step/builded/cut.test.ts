import { type Cut, CutStep } from "../cut";
import { BuildedCutStep } from "./cut";
import { Response } from "@scripts/response";
import { zod } from "@scripts/parser";
import { duploTest } from "@test/utils/duploTest";

it("BuildedCutStep", () => {
	const cutFunction: Cut = ({ dropper }) => dropper(null);

	const step = new CutStep(cutFunction, ["test"], [new Response(100, "toto", zod.undefined())]);
	const buildedCutStep = new BuildedCutStep(duploTest, step);

	expect(buildedCutStep.step).toBe(step);

	expect(buildedCutStep.cutFunction).toBe(cutFunction);

	expect(buildedCutStep.drop).toStrictEqual(["test"]);

	expect(buildedCutStep.toString(2)).toMatchSnapshot();
});

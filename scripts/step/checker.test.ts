import { BuildedCheckerStep, Checker, CheckerStep, type CheckerStepParams } from "..";
import { Response } from "@scripts/response";

it("CheckerStep", () => {
	const checker = new Checker("test");

	const params: CheckerStepParams = {
		input: () => ({}),
		catch: () => new Response(300, "test", 11),
		result: "",
	};

	const step = new CheckerStep(checker, params);

	expect(step.parent).toBe(checker);

	expect(step.params).toBe(params);

	expect(step.build()).instanceOf(BuildedCheckerStep);
});
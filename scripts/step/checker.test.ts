import { duploTest } from "@test/utils/duploTest";
import { BuildedCheckerStep, Checker, CheckerStep, type CheckerStepParams } from "..";
import { Response } from "@scripts/response";

it("CheckerStep", async() => {
	const checker = new Checker("test");

	const params: CheckerStepParams = {
		input: () => ({}),
		catch: () => new Response(300, "test", 11),
		result: "",
	};

	const step = new CheckerStep(checker, params);

	expect(step.parent).toBe(checker);

	expect(step.params).toBe(params);

	expect(await step.build(duploTest)).instanceOf(BuildedCheckerStep);
});

import { duploTest } from "@test/utils/duploTest";
import { BuildedStepWithResponses } from ".";
import { HandlerStep } from "../handler";
import { Response } from "@scripts/response";
import { zod } from "@scripts/parser";
import { ContractResponseHasZodEffectError } from "@scripts/error/contractResponseHasZodEffectError";

class TestBuildedStepWithResponses extends BuildedStepWithResponses {
	public toString(index: number): string {
		throw new Error("Method not implemented.");
	}
}

it("BuildedStepWithResponses error", () => {
	const step = new HandlerStep(
		() => new Response(200, undefined, undefined),
		[new Response(100, "toto", zod.undefined().transform((value) => value))],
	);

	expect(() => new TestBuildedStepWithResponses(duploTest, step))
		.toThrow(ContractResponseHasZodEffectError);
});

import { duploTest } from "@test/utils/duploTest";
import { zod } from "..";
import { ExtractStep } from "./extract";
import { BuildedExtractStep } from "./builded/extract";

it("ExtractStep", async() => {
	const extractObject = {
		body: zod.object({
			prop1: zod.string(),
		}),
	};

	const step = new ExtractStep(
		extractObject,
		undefined,
		[],
	);

	expect(step.parent).toBe(extractObject);

	expect(await step.build(duploTest)).instanceOf(BuildedExtractStep);
});

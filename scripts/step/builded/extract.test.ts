import { zod } from "@scripts/parser";
import { ExtractStep } from "../extract";
import { BuildedExtractStep } from "./extract";
import { duploTest } from "@test/utils/duploTest";
import { manualPresetChecker } from "@test/utils/manualDuplose";
import { ZodAcceleratorParser } from "@duplojs/zod-accelerator";

it("BuildedExtractStep", () => {
	const extractObject = {
		query: {
			search: zod.string(),
		},
		body: zod.object({
			prop1: zod.string(),
		}),
	};

	const catchError = () => <never>({});

	const step = new ExtractStep(
		extractObject,
		catchError,
		[],
	);
	const buildedExtractStep = new BuildedExtractStep(duploTest, step);

	expect(buildedExtractStep.extractObject.body).instanceOf(ZodAcceleratorParser);

	expect(buildedExtractStep.catchError).toBe(catchError);

	expect(buildedExtractStep.toString(4)).toMatchSnapshot();
});

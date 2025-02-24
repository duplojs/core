import { createChecker, createPresetChecker, BadRequestHttpResponse, createProcess, ProcessStep, CheckerStep } from "@scripts/index";
import { TestDescription } from "./testDescription";

export const fixtureProcessWichDropValue = createProcess(
	"processWichDropValue",
	{
		options: {
			option1: "test",
			option2: 12,
		},
		input: 22,
	},
)
	.cut(
		async({ pickup, dropper }) => {
			const value = await dropper({
				dropOptions: pickup("options"),
				dropInput: pickup("input"),
			});

			return value;
		},
		["dropInput", "dropOptions"],
	)
	.exportation(["dropOptions", "dropInput"]);

export const fixtureProcessStep = new ProcessStep(fixtureProcessWichDropValue);

export const fixtureCheckerWithoutOptions = createChecker("checkerWithoutOptions")
	.handler(
		async(input: number, output) => {
			await Promise.resolve();

			if (input) {
				return output("yes", <const>true);
			}
			return output("no", <const>false);
		},
	);

export const fixtureCheckerStep = new CheckerStep(fixtureCheckerWithoutOptions, {} as never);

export const fixtureCheckerWithOptions = createChecker(
	"checkerWithoutOptions",
	{
		option1: "test",
		option2: 11,
	},
)
	.handler(
		async(input: number, output, options) => {
			await Promise.resolve();

			if (input) {
				return output("yes", options);
			}
			return output("no", <const>false);
		},
	);

export const fixturePresetChecker = createPresetChecker(
	fixtureCheckerWithOptions,
	{
		result: "yes",
		catch: () => new BadRequestHttpResponse(undefined, undefined),
		options: {
			option1: "settedOption",
		},
	},
);

export const fixtureDescription = new TestDescription();


import { createChecker, useBuilder } from "@scripts/index";

export const processWichDropValue = useBuilder()
	.createProcess("processWichDropValue")
	.cut(
		async({ dropper }) => {
			const value = await dropper({ dropValue: "test" });

			return value;
		},
		["dropValue"],
	)
	.exportation(["dropValue"]);

export const processWithOptionAndInput = useBuilder()
	.createProcess(
		"processWithOptionAndInput",
		{
			options: {
				value: "",
			},
			input: 22,
		},
	)
	.exportation();

export const checkerWithoutOptions = createChecker("checkerWithoutOptions")
	.handler(
		async(input: number, output) => {
			await Promise.resolve();

			if (input) {
				return output("yes", <const>true);
			}
			return output("no", <const>false);
		},
	);

export const checkerWithOptions = createChecker(
	"checkerWithoutOptions",
	{
		option1: "test",
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

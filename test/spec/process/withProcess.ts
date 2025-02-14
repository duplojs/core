import { type ExpectType } from "@duplojs/utils";
import { useBuilder } from "@scripts/index";
import { fixtureProcessWichDropValue } from "@test/utils/fixture";

export const processWithProcess = useBuilder()
	.createProcess("processWithProcess")
	.execute(
		fixtureProcessWichDropValue,
		{
			pickup: ["dropOptions", "dropInput"],
			options: { option1: "myOption" },
			input: () => 66,
		},
	)
	.cut(
		({ dropper, pickup }) => {
			const { dropInput, dropOptions } = pickup(["dropInput", "dropOptions"]);

			type check1 = ExpectType<
				typeof dropInput,
				number,
				"strict"
			>;

			type check2 = ExpectType<
				typeof dropOptions,
				{
					option1: string;
					option2: number;
				},
				"strict"
			>;

			return dropper({
				dropInput1: dropInput,
				dropOptions1: dropOptions,
			});
		},
		["dropOptions1", "dropInput1"],
	)
	.execute(
		fixtureProcessWichDropValue,
		{
			pickup: ["dropOptions", "dropInput"],
			options: (pickup) => {
				const { dropOptions } = pickup(["dropOptions"]);
				return {
					...dropOptions,
					option2: 33,
				};
			},
		},
	)
	.cut(
		({ dropper, pickup }) => {
			const { dropInput, dropOptions } = pickup(["dropInput", "dropOptions"]);

			return dropper({
				dropInput2: dropInput,
				dropOptions2: dropOptions,
			});
		},
		["dropOptions2", "dropInput2"],
	)
	.exportation(["dropOptions1", "dropInput1", "dropOptions2", "dropInput2"]);

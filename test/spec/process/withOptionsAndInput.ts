import { useBuilder } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";

export const processWithOptionsAndInput = useBuilder()
	.createProcess(
		"processWithOptionsAndInput",
		{
			options: {
				option1: 12,
				option2: "ee",
			},
			input: "test",
		},
	)
	.cut(
		({ pickup, dropper }) => {
			const { options, input } = pickup(["options", "input"]);

			type check2 = ExpectType<
				typeof options,
				{
					option1: number;
					option2: string;
				},
				"strict"
			>;

			type check3 = ExpectType<
				typeof input,
				string,
				"strict"
			>;

			return dropper({});
		},
	)
	.exportation(["input", "options"]);

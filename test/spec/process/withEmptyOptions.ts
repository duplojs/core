import { type ProcessBuilder, useBuilder } from "@scripts/index";
import { type ExpectType } from "@test/utils/expectType";

interface Options {

}

export const processWithEmptyOptions = useBuilder()
	.createProcess(
		"processWithEmptyOptions",
		{
			options: <Options>{},
		},
	)
	.cut(
		({ pickup, dropper }) => {
			const { options } = pickup(["options"]);

			type check = ExpectType<
				typeof options,
				{},
				"strict"
			>;

			return dropper(null);
		},
	)
	.exportation(["input", "options"]);

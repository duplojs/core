import { type ExpectType } from "@duplojs/utils";
import { createProcess, useBuilder } from "@scripts/index";

interface Options {

}

export const processWithEmptyOptions = createProcess(
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

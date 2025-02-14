import { type ExpectType } from "@duplojs/utils";
import { useBuilder } from "@scripts/index";

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

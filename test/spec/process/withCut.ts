import { useBuilder } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";

export const processWithCut = useBuilder()
	.createProcess("process")
	.cut(
		({ dropper }) => dropper({ value: "test" }),
		["value"],
	)
	.cut(
		({ pickup, dropper }) => {
			const { value, options, input } = pickup(["value", "options", "input"]);

			type check1 = ExpectType<
				typeof value,
				string,
				"strict"
			>;

			type check2 = ExpectType<
				typeof options,
				undefined,
				"strict"
			>;

			type check3 = ExpectType<
				typeof input,
				undefined,
				"strict"
			>;

			return dropper(null);
		},
	)
	.exportation(["value"]);

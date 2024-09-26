import { OkHttpResponse, useBuilder } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";
import { fixtureProcessWichDropValue } from "@test/utils/fixture";

export const preflightOnProcess = useBuilder()
	.preflight(
		fixtureProcessWichDropValue,
		{ pickup: ["dropInput", "dropOptions"] },
	)
	.createProcess("preflightOnProcess")
	.cut(
		({ pickup, dropper }) => {
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
				dropInput,
				dropOptions,
			});
		},
		["dropInput", "dropOptions"],
	)
	.exportation(["dropInput", "dropOptions"]);

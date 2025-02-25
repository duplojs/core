import { type ExpectType } from "@duplojs/utils";
import { createProcess, useBuilder, zod } from "@scripts/index";
import { fixturePresetChecker } from "@test/utils/fixture";

export const processWithPresetChecker = createProcess("processWithPresetChecker")
	.extract({
		body: zod.number(),
	})
	.presetCheck(
		fixturePresetChecker.rewriteIndexing("valueCheck"),
		(pickup) => {
			const body = pickup("body");
			type check2 = ExpectType<
				typeof body,
				number,
				"strict"
			>;
			return body;
		},
	)
	.cut(
		({ pickup, dropper }) => {
			const { valueCheck } = pickup(["valueCheck"]);

			type check2 = ExpectType<
				typeof valueCheck,
				{
					option1: string;
					option2: number;
				},
				"strict"
			>;

			return dropper({ });
		},
	)
	.exportation(["valueCheck"]);

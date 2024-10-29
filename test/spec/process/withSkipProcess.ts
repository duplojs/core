import { useBuilder, zod } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";
import { fixtureProcessWichDropValue } from "@test/utils/fixture";

export const processWithSkipProcess = useBuilder()
	.createProcess("processWithProcess")
	.extract({
		body: zod.number(),
	})
	.execute(
		fixtureProcessWichDropValue,
		{
			pickup: ["dropOptions", "dropInput"],
			skip: (pickup) => {
				const { body } = pickup(["body"]);

				type check2 = ExpectType<
					typeof body,
					number,
					"strict"
				>;

				return !!body;
			},
		},
	)
	.cut(
		({ dropper, pickup }) => {
			const { dropInput, dropOptions } = pickup(["dropInput", "dropOptions"]);

			type check1 = ExpectType<
				typeof dropInput,
				number | undefined,
				"strict"
			>;

			type check2 = ExpectType<
				typeof dropOptions,
				{
					option1: string;
					option2: number;
				} | undefined,
				"strict"
			>;

			return dropper(null);
		},
	)
	.exportation(["dropInput", "dropOptions"]);

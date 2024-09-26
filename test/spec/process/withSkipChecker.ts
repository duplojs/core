import { useBuilder, zod, Response } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";
import { fixtureCheckerWithoutOptions } from "@test/utils/fixture";

export const processWithSkipChecker = useBuilder()
	.createProcess("processWithSkipStep")
	.extract({
		body: zod.number(),
	})
	.check(
		fixtureCheckerWithoutOptions,
		{
			input: () => 1,
			result: ["yes"],
			catch: () => new Response(400, "first", undefined),
			indexing: "valueCheck",
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
		({ pickup, dropper }) => {
			const { valueCheck } = pickup(["valueCheck"]);

			type check2 = ExpectType<
				typeof valueCheck,
				true | undefined,
				"strict"
			>;

			return dropper({ });
		},
	)
	.exportation(["valueCheck"]);

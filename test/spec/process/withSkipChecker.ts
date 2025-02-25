import { type ExpectType } from "@duplojs/utils";
import { useBuilder, zod, Response, createProcess } from "@scripts/index";
import { fixtureCheckerWithoutOptions } from "@test/utils/fixture";

export const processWithSkipChecker = createProcess("processWithSkipStep")
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

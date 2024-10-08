import { useBuilder, zod, Response } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";
import { fixtureCheckerWithoutOptions } from "@test/utils/fixture";

export const processWithCheckerWithNoOptions = useBuilder()
	.createProcess("processWithCheckerWithNoOptions")
	.extract({
		body: zod.number(),
	})
	.check(
		fixtureCheckerWithoutOptions,
		{
			input: (pickup) => {
				const body = pickup("body");
				type check2 = ExpectType<
					typeof body,
					number,
					"strict"
				>;
				return body;
			},
			result: "yes",
			catch: () => new Response(400, "first", undefined),
			indexing: "valueCheck",
		},
	)
	.cut(
		({ pickup, dropper }) => {
			const { valueCheck } = pickup(["valueCheck"]);

			type check2 = ExpectType<
				typeof valueCheck,
				true,
				"strict"
			>;

			return dropper({ });
		},
	)
	.check(
		fixtureCheckerWithoutOptions,
		{
			input: (pickup) => pickup("body"),
			result: ["yes"],
			catch: () => new Response(400, "seconds", undefined),
		},
	)
	.cut(
		({ pickup, dropper }) => {
			const { valueCheck } = pickup(["valueCheck"]);

			type check2 = ExpectType<
					typeof valueCheck,
				true,
				"strict"
			>;

			return dropper({ });
		},
	)
	.exportation(["valueCheck"]);

import { OkHttpResponse, useBuilder, zod } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";
import { fixtureProcessWichDropValue } from "@test/utils/fixture";

export const routeWithSkipProcess = useBuilder()
	.createRoute("GET", "/")
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
	.handler(
		(pickup) => {
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

			return new OkHttpResponse(undefined, {
				dropInput,
				dropOptions,
			});
		},
	);

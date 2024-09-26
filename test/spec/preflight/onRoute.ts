import { OkHttpResponse, useBuilder } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";
import { fixtureProcessWichDropValue } from "@test/utils/fixture";

export const preflightOnRoute = useBuilder()
	.preflight(
		fixtureProcessWichDropValue,
		{ pickup: ["dropInput", "dropOptions"] },
	)
	.createRoute("GET", "/")
	.handler(
		(pickup) => {
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

			return new OkHttpResponse(undefined, {
				dropInput,
				dropOptions,
			});
		},
	);

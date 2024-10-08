import { OkHttpResponse, useBuilder, zod } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";
import { fixturePresetChecker } from "@test/utils/fixture";

export const routeWithPresetChecker = useBuilder()
	.createRoute("GET", "/")
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
	.handler(
		(pickup) => {
			const { valueCheck } = pickup(["valueCheck"]);

			type check2 = ExpectType<
				typeof valueCheck,
				{
					option1: string;
					option2: number;
				},
				"strict"
			>;

			return new OkHttpResponse(undefined, { valueCheck });
		},
	);

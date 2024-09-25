import { OkHttpResponse, useBuilder } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";

export const routeWithCut = useBuilder()
	.createRoute("GET", "/")
	.cut(
		({ dropper }) => dropper({ value: "test" }),
		["value"],
	)
	.handler(
		(pickup) => {
			const { value } = pickup(["value"]);

			type check1 = ExpectType<
				typeof value,
				string,
				"strict"
			>;

			return new OkHttpResponse(undefined, { value });
		},
	);

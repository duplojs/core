import { type ExpectType } from "@duplojs/utils";
import { OkHttpResponse, useBuilder } from "@scripts/index";

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

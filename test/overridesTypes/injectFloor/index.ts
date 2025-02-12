import { OkHttpResponse, useBuilder } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";

declare module "@scripts/index" {
	interface InjectFloorValues {
		test: string;
	}
}

useBuilder()
	.createRoute("GET", "/user/{userId}")
	.handler(
		(pickup) => {
			const { test } = pickup(["test"]);

			type check = ExpectType<
				typeof test,
				string,
				"strict"
			>;

			return new OkHttpResponse("test");
		},
	);

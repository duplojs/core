import { useBuilder } from "@scripts/builder";
import { OkHttpResponse, useProcessBuilder } from "@scripts/index";
import { zod } from "@scripts/parser";
import { processWith13Steps } from "./process/with13Steps";
import { processWith12Steps } from "./process/with12Steps";
import { type ExpectType } from "@duplojs/utils";
import { duploTest } from "@test/utils/duploTest";

const route = useBuilder()
	.preflight(processWith12Steps, { pickup: ["test12"] })
	.createRoute("GET", "/")
	.execute(processWith13Steps, { pickup: ["test13"] })
	.extract({
		params: {
			t0: zod.string(),
		},
	})
	.extract({
		params: {
			t1: zod.string(),
		},
	})
	.extract({
		params: {
			t2: zod.string(),
		},
	})
	.extract({
		params: {
			t3: zod.string(),
		},
	})
	.extract({
		params: {
			t4: zod.string(),
		},
	})
	.extract({
		params: {
			t5: zod.string(),
		},
	})
	.extract({
		params: {
			t6: zod.string(),
		},
	})
	.extract({
		params: {
			t7: zod.string(),
		},
	})
	.extract({
		params: {
			t8: zod.string(),
		},
	})
	.extract({
		params: {
			t9: zod.string(),
		},
	})
	.extract({
		params: {
			t10: zod.string(),
		},
	})
	.extract({
		params: {
			t11: zod.string(),
		},
	})
	.extract({
		params: {
			t12: zod.string(),
		},
	})
	.handler(
		(pickup) => {
			const values = pickup([
				"t0",
				"t1",
				"t2",
				"t3",
				"t4",
				"t5",
				"t6",
				"t7",
				"t8",
				"t9",
				"t10",
				"t11",
				"t12",
				"test12",
				"test13",
			]);

			type check = ExpectType<
				typeof values,
				{
					test13: string;
					test12: string;
					t0: string;
					t1: string;
					t2: string;
					t3: string;
					t4: string;
					t5: string;
					t6: string;
					t7: string;
					t8: string;
					t9: string;
					t10: string;
					t11: string;
					t12: string;
				},
				"strict"
			>;

			return new OkHttpResponse("test");
		},
	);

it("correct build", async() => {
	duploTest.register(route, ...useProcessBuilder.getAllCreatedProcess());

	await route.build();
});

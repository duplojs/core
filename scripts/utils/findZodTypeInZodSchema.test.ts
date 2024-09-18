import { zod } from "@scripts/zod";
import { findZodTypeInZodSchema } from "./findZodTypeInZodSchema";
import { ZodString } from "zod";

it("findZodTypeInZodSchema", () => {
	const zodSchema: any = zod.object({
		test: zod.lazy(
			() => zodSchema,
		),
		test1: zod.string().catch("22"),
		test2: zod.string().default("22"),
		test3: zod.map(zod.string(), zod.string()),
		test4: zod.set(zod.string()).and(zod.number()),
		test5: zod.pipeline(zod.string(), zod.string()),
		test6: zod.record(zod.string(), zod.number()),
	})
		.readonly()
		.array()
		.promise()
		.optional()
		.nullable()
		.transform((value) => value)
		.or(
			zod
				.tuple([zod.string()])
				.rest(zod.string()),
		);

	expect(
		findZodTypeInZodSchema([ZodString], zodSchema).length,
	).toBe(10);
});

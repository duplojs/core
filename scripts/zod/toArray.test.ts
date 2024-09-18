import { zod } from ".";

it("toArray", () => {
	const zodSchema = zod.object({
		prop1: zod.string(),
		prop2: zod.number(),
	}).toArray();

	expect(
		zodSchema.parse({
			prop1: "test",
			prop2: 8,
		}),
	).toStrictEqual([
		{
			prop1: "test",
			prop2: 8,
		},
	]);

	expect(
		zodSchema.parse([
			{
				prop1: "test",
				prop2: 8,
			},
		]),
	)
		.toStrictEqual([
			{
				prop1: "test",
				prop2: 8,
			},
		]);
});

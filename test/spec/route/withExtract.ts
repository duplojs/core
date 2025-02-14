import { type ExpectType } from "@duplojs/utils";
import { OkHttpResponse, useBuilder, zod } from "@scripts/index";

export const routeWithExtract = useBuilder()
	.createRoute("GET", "/")
	.extract({
		params: {
			userId: zod.string(),
		},
		body: zod.object({
			prop1: zod.string(),
			prop2: zod.object({
				prop3: zod.string(),
				prop4: zod.object({
					prop5: zod.string(),
				}),
			}).strip(),
		}).strip(),
	})
	.handler(
		(pickup) => {
			const { userId, body } = pickup(["userId", "body"]);

			type check2 = ExpectType<
				typeof userId,
				string,
				"strict"
			>;

			type check3 = ExpectType<
				typeof body,
				{
					prop1: string;
					prop2: {
						prop3: string;
						prop4: {
							prop5: string;
						};
					};
				},
				"strict"
			>;

			return new OkHttpResponse(undefined, {
				userId,
				body,
			});
		},
	);

import { type ExpectType } from "@duplojs/utils";
import { useBuilder, zod, Response, OkHttpResponse, BadRequestHttpResponse } from "@scripts/index";
import { fixtureCheckerWithOptions } from "@test/utils/fixture";

export const routeWithChecker = useBuilder()
	.createRoute("GET", "/")
	.extract({
		body: zod.number(),
	})
	.check(
		fixtureCheckerWithOptions,
		{
			input: (pickup) => pickup("body"),
			result: "yes",
			catch: () => new BadRequestHttpResponse("first", undefined),
			indexing: "valueCheck1",
			options: {
				option1: "toto",
			},
		},
	)
	.check(
		fixtureCheckerWithOptions,
		{
			input: (pickup) => pickup("body"),
			result: "yes",
			catch: () => new Response(400, "first", undefined),
			indexing: "valueCheck2",
			options: (pickup) => {
				const body = pickup("body");

				type check2 = ExpectType<
					typeof body,
					number,
					"strict"
				>;

				return {
					option1: body.toString(),
				};
			},
		},
	)
	.handler(
		(pickup) => new OkHttpResponse(undefined, pickup(["valueCheck1", "valueCheck2"])),
	);

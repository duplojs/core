import { createChecker, useBuilder, zod, Response } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";
import { checkerWithOptions, checkerWithoutOptions } from "@test/utils/fixture";

describe("process", () => {
	const process = useBuilder()
		.createProcess("process")
		.cut(
			({ dropper }) => dropper({ value: "test" }),
			["value"],
		)
		.cut(
			({ pickup, dropper }) => {
				const { value, options, input } = pickup(["value", "options", "input"]);

			type check1 = ExpectType<
				typeof value,
				string,
				"strict"
			>;

			type check2 = ExpectType<
				typeof options,
				undefined,
				"strict"
			>;

			type check3 = ExpectType<
				typeof input,
				undefined,
				"strict"
			>;

			return dropper({});
			},
		)
		.exportation(["value"]);

	const processWithOptionAndInput = useBuilder()
		.createProcess(
			"processWithOptionAndInput",
			{
				options: { test: 12 },
				input: "test",
			},
		)
		.cut(
			({ pickup, dropper }) => {
				const { options, input } = pickup(["options", "input"]);

			type check2 = ExpectType<
				typeof options,
				{ test: number },
				"strict"
			>;

			type check3 = ExpectType<
				typeof input,
				string,
				"strict"
			>;

			return dropper({});
			},
		)
		.exportation();

	const processWithExtract = useBuilder()
		.createProcess("processWithExtract")
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
				}).passthrough(),
			}).passthrough(),
		})
		.cut(
			({ pickup, dropper }) => {
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

				return dropper({});
			},
		)
		.exportation();

	const processWithCheckerWithNoOptions = useBuilder()
		.createProcess("processWithCheckerWithNoOptions")
		.extract({
			body: zod.number(),
		})
		.check(
			checkerWithoutOptions,
			{
				input: (pickup) => {
					const body = pickup("body");
					type check2 = ExpectType<
						typeof body,
						number,
						"strict"
					>;
					return body;
				},
				result: "yes",
				catch: () => new Response(400, "first", undefined),
				indexing: "valueCheck",
			},
		)
		.cut(
			({ pickup, dropper }) => {
				const { valueCheck } = pickup(["valueCheck"]);

				type check2 = ExpectType<
					typeof valueCheck,
					true,
					"strict"
				>;

				return dropper({ });
			},
		)
		.check(
			checkerWithoutOptions,
			{
				input: (pickup) => pickup("body"),
				result: ["yes"],
				catch: () => new Response(400, "seconds", undefined),
			},
		)
		.cut(
			({ pickup, dropper }) => {
				const { valueCheck } = pickup(["valueCheck"]);

				type check2 = ExpectType<
					typeof valueCheck,
					true,
					"strict"
				>;

				return dropper({ });
			},
		)
		.exportation();

	const processWithChecker = useBuilder()
		.createProcess("processWithChecker")
		.extract({
			body: zod.number(),
		})
		.check(
			checkerWithOptions,
			{
				input: (pickup) => pickup("body"),
				result: "yes",
				catch: () => new Response(400, "first", undefined),
				indexing: "valueCheck1",
				options: {
					option1: "toto",
				},
			},
		)
		.check(
			checkerWithOptions,
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
		.exportation(["valueCheck1", "valueCheck2"]);

	it("test", () => {

	});
});

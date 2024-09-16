import { createChecker, createPresetChecker } from "@scripts/builder/checker";
import { Response } from "@scripts/response";
import { zod, zodSchemaHasPresetChecker } from ".";
import type { ExpectType } from "@test/utils/expectType";
import { number, ZodError, type ZodEffects, type ZodNumber } from "zod";
import { manualPresetChecker } from "@test/utils/manualDuplose";
import { MissingHandlerCheckerError } from "@scripts/error/missingHandlerCheckerError";

describe("presetCheck", () => {
	const isOddChecker = createChecker("isOdd")
		.handler(
			(input: number, output) => {
				if (input % 2 === 0) {
					return output("even", <const>"even");
				}

				return output("odd", <const>"odd");
			},
		);

	const wantEven = createPresetChecker(
		isOddChecker,
		{
			result: "even",
			catch: () => new Response(400, "odd", undefined),
		},
		new Response(400, "odd", zod.undefined()),
	);

	const isOddCheckerAsync = createChecker("isOdd")
		.handler(
			(input: number, output) => {
				if (input % 2 === 0) {
					return Promise.resolve(output("even", <const>"even"));
				}

				return Promise.resolve(output("odd", <const>"odd"));
			},
		);

	const wantEvenAsync = createPresetChecker(
		isOddCheckerAsync,
		{
			result: "even",
			transformInput: (input: string) => Number(input),
			catch: () => new Response(400, "odd", undefined),
		},
		new Response(400, "odd", zod.undefined()),
	);

	it("zodSchemaHasPresetChecker", () => {
		const zodSchema = zod.number().presetCheck(wantEven);

		expect(zodSchemaHasPresetChecker(zodSchema)).toBe(true);

		type check = ExpectType<
			typeof zodSchema,
			ZodEffects<
				ZodNumber,
				"even",
				number
			>,
			"strict"
		>;
	});

	it("perset check sync", () => {
		const zodSchema = zod.number().presetCheck(wantEven);

		expect(
			zodSchema.safeParse(1).error?.issues[0],
		).toStrictEqual({
			path: [],
			code: "custom",
			message: "",
			params: {
				response: new Response(400, "odd", undefined),
			},
		});

		expect(zodSchema.parse(2)).toBe("even");
	});

	it("perset check async", async() => {
		const zodSchema = zod.string().presetCheck(wantEvenAsync);

		expect(
			(await zodSchema.safeParseAsync("1")).error?.issues[0],
		).toStrictEqual({
			path: [],
			code: "custom",
			message: "",
			params: {
				response: new Response(400, "odd", undefined),
			},
		});

		expect(await zodSchema.parseAsync("2")).toBe("even");
	});

	it("missing handler", () => {
		expect(
			() => zod.string().presetCheck(manualPresetChecker),
		).toThrowError(MissingHandlerCheckerError);
	});
});

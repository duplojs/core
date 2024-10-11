import { createChecker, createPresetChecker, PresetChecker } from "@scripts/builder/checker";
import { Response } from "@scripts/response";
import { zod, zodSchemaHasPresetChecker, type ZodPresetChecker } from ".";
import type { ExpectType } from "@test/utils/expectType";
import { type ZodNumber } from "zod";
import { MissingHandlerCheckerError } from "@scripts/error/missingHandlerCheckerError";
import { zodSchemaIsAsync } from "@duplojs/zod-accelerator";
import { Checker } from "@scripts/checker";

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

		expect(zodSchemaIsAsync(zodSchema)).toBe(true);

		expect(zodSchemaHasPresetChecker(zodSchema)).toBe(true);

		type check = ExpectType<
			typeof zodSchema,
			ZodPresetChecker<
				ZodNumber,
				typeof wantEven,
				number
			>,
			"strict"
		>;
	});

	it("perset check sync", async() => {
		const zodSchema = zod.number().presetCheck(wantEven);

		expect(
			(await zodSchema.safeParseAsync(1)).error?.issues[0],
		).toStrictEqual({
			path: [],
			code: "custom",
			message: "",
			params: {
				response: new Response(400, "odd", undefined),
			},
		});

		const data = await zodSchema.parseAsync(2);

		expect(data).toBe("even");

		type check = ExpectType<
			typeof data,
			"even",
			"strict"
		>;
	});

	it("perset check async", async() => {
		const zodSchema = zod.string().presetCheck(wantEvenAsync);

		expect(zodSchemaIsAsync(zod.string().transform(() => Promise.resolve()))).toBe(true);
		expect(zodSchemaIsAsync(zodSchema)).toBe(true);

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
			() => zod.string().presetCheck(
				new PresetChecker(
					new Checker("test"),
					{
						result: "test",
						catch: () => void undefined as never,
					},
					[],
				),
			),
		).toThrowError(MissingHandlerCheckerError);
	});

	it("error async", async() => {
		const errorChecker = createChecker("error")
			.handler(
				(input: number, output) => Promise.reject(new Error()),
			);

		const zodSchema = zod.string().presetCheck(
			new PresetChecker(
				errorChecker,
				{
					result: "test" as never,
					catch: () => void undefined as never,
				},
				[],
			),
		);

		await expect(
			() => zodSchema.parseAsync("toto"),
		).rejects.toThrowError(Error);
	});

	it("error sync", async() => {
		const errorChecker = createChecker("error")
			.handler(
				(input: number, output) => {
					throw new Error();
				},
			);

		const zodSchema = zod.string().presetCheck(
			new PresetChecker(
				errorChecker,
				{
					result: "test" as never,
					catch: () => void undefined as never,
				},
				[],
			),
		);

		await expect(
			() => zodSchema.parseAsync("toto"),
		).rejects.toThrowError(Error);
	});
});

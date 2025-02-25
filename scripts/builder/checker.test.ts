import { Checker, type CheckerOutput, type GetCheckerGeneric } from "@scripts/checker";
import { PresetChecker, createChecker, createPresetChecker, type GetPresetCheckerGeneric } from "./checker";
import { ForbiddenHttpResponse, OkHttpResponse, UnprocessableEntityHttpResponse } from "@scripts/response/simplePreset";
import { zod, type Response } from "..";
import type { ZodUndefined } from "zod";
import { type ExpectType } from "@duplojs/utils";

describe("checker builder", () => {
	it("create without options", () => {
		const isOdd = createChecker("isOdd")
			.handler((input: number, output, options) => {
				type check = ExpectType<
					typeof options,
					undefined,
					"strict"
				>;

				if (input % 2 === 1) {
					return output("odd", input);
				} else {
					return output("notOdd", input);
				}
			});

		expect(isOdd).instanceOf(Checker);
		expect(isOdd.options).toBe(undefined);
		expect(isOdd.handler).toBeTypeOf("function");

		type check = ExpectType<
			GetCheckerGeneric<typeof isOdd>,
			{
				options: undefined;
				input: number;
				output:
					| CheckerOutput<"odd", number>
					| CheckerOutput<"notOdd", number>;
			},
			"strict"
		>;
	});

	it("create with options", () => {
		const isEmpty = createChecker<{ test: string }>("isOdd", { test: "ok" })
			.handler((input: string, output, options) => {
				type check = ExpectType<
					typeof options,
					{ test: string },
					"strict"
				>;

				if (input === "") {
					return output("empty", input);
				} else {
					return output("notEmpty", input);
				}
			});

		type check = ExpectType<
			GetCheckerGeneric<typeof isEmpty>,
			{
				options: { test: string };
				input: string;
				output:
					| CheckerOutput<"empty", string>
					| CheckerOutput<"notEmpty", string>;
			},
			"strict"
		>;
	});

	describe("preset checker", () => {
		const isOdd = createChecker("isOdd")
			.handler((input: number, output, options) => {
				if (input % 2 === 1) {
					return output("odd", input);
				} else {
					return output("notOdd", input);
				}
			});

		const preset = createPresetChecker(
			isOdd,
			{
				result: "odd",
				catch: () => new UnprocessableEntityHttpResponse("notOdd", undefined),
				indexing: "number",
			},
			[
				new UnprocessableEntityHttpResponse("notOdd", zod.undefined()),
				new OkHttpResponse("odd", zod.undefined()),
			],
		);

		it("createPresetChecker", () => {
			expect(preset).instanceOf(PresetChecker);

			type check1 = ExpectType<
				GetPresetCheckerGeneric<typeof preset>,
				{
					checker: typeof isOdd;
					info: "odd";
					key: "number";
					response:
						| Response<200, "odd", ZodUndefined>
						| Response<422, "notOdd", ZodUndefined>;
					newInput: number;
					outputData: number;
					checkerGeneric: GetCheckerGeneric<typeof isOdd>;
				},
				"strict"
			>;
		});

		it("rewrite Indexing", () => {
			const newPreset = preset.rewriteIndexing("test");

			expect(newPreset).instanceOf(PresetChecker);
			expect(newPreset.params.indexing).toBe("test");

			type check2 = ExpectType<
				GetPresetCheckerGeneric<typeof newPreset>,
				{
					checker: typeof isOdd;
					info: "odd";
					key: "test";
					response:
						| Response<200, "odd", ZodUndefined>
						| Response<422, "notOdd", ZodUndefined>;
					newInput: number;
					outputData: number;
					checkerGeneric: GetCheckerGeneric<typeof isOdd>;
				},
				"strict"
			>;
		});

		it("transform input", () => {
			const presetWithTransformInput = createPresetChecker(
				isOdd,
				{
					result: "notOdd",
					catch: () => new OkHttpResponse("odd", undefined),
					transformInput: (input: symbol) => Number(input),
				},
				new OkHttpResponse("odd", zod.undefined()),
			);

			type check3 = ExpectType<
				GetPresetCheckerGeneric<typeof presetWithTransformInput>,
				{
					checker: typeof isOdd;
					info: "notOdd";
					key: string;
					response: Response<200, "odd", ZodUndefined>;
					newInput: symbol;
					outputData: number;
					checkerGeneric: GetCheckerGeneric<typeof isOdd>;
				},
				"strict"
			>;
		});

		it("transform input", () => {
			const newPreset = preset.transformInput((input: string) => Number(input));

			expect(newPreset).instanceOf(PresetChecker);
			expect(newPreset.params.transformInput?.("1")).toBe(1);

			type check1 = ExpectType<
				GetPresetCheckerGeneric<typeof newPreset>,
				{
					checker: typeof isOdd;
					info: "odd";
					key: "number";
					response:
						| Response<200, "odd", ZodUndefined>
						| Response<422, "notOdd", ZodUndefined>;
					newInput: string;
					outputData: number;
					checkerGeneric: GetCheckerGeneric<typeof isOdd>;
				},
				"strict"
			>;
		});

		it("redefine catch", () => {
			const catchError = () => new ForbiddenHttpResponse("test");

			const newPreset = preset.redefineCatch(
				catchError,
				new ForbiddenHttpResponse("test", zod.undefined()),
			);

			expect(newPreset).instanceOf(PresetChecker);
			expect(newPreset.params.catch).toBe(catchError);

			type check1 = ExpectType<
				GetPresetCheckerGeneric<typeof newPreset>,
				{
					checker: typeof isOdd;
					info: "odd";
					key: "number";
					response: Response<403, "test", ZodUndefined>;
					newInput: number;
					outputData: number;
					checkerGeneric: GetCheckerGeneric<typeof isOdd>;
				},
				"strict"
			>;
		});
	});
});

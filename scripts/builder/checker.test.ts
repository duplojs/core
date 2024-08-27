import { Checker, type CheckerOutput, type GetCheckerGeneric } from "@scripts/checker";
import { PresetChecker, createChecker, createPresetChecker, type GetPresetCheckerGeneric } from "./checker";
import type { ExpectType } from "@test/utils/expectType";
import { OkHttpResponse, UnprocessableEntityHttpResponse } from "@scripts/response/simplePreset";
import { zod, type Response } from "..";

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

	it("preset checker", () => {
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

		expect(preset).instanceOf(PresetChecker);

		type check1 = ExpectType<
			GetPresetCheckerGeneric<typeof preset>,
			{
				checker: typeof isOdd;
				info: "odd";
				key: "number";
				response:
					| Response<200, "odd", undefined>
					| Response<422, "notOdd", undefined>;
				newInput: unknown;
			},
			"strict"
		>;

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
					| Response<200, "odd", undefined>
					| Response<422, "notOdd", undefined>;
				newInput: unknown;
			},
			"strict"
		>;

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
				response: Response<200, "odd", undefined>;
				newInput: symbol;
			},
			"strict"
		>;
	});
});

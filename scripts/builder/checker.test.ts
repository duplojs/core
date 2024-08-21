import { Checker, type CheckerOutput, type GetCheckerGeneric } from "@scripts/checker";
import { CheckerPreset, createChecker, createCheckerPreset, type GetCheckerPresetGeneric } from "./checker";
import type { ExpectType } from "@test/utils/expectType";
import { OkHttpResponse, UnprocessableEntityHttpResponse } from "@scripts/response/simplePreset";
import { zod, type Response } from "..";

describe("checker builder", () => {
	it("create without options", () => {
		const isOdd = createChecker("isOdd", undefined)
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
		const isOdd = createChecker("isOdd", undefined)
			.handler((input: number, output, options) => {
				if (input % 2 === 1) {
					return output("odd", input);
				} else {
					return output("notOdd", input);
				}
			});

		const preset = createCheckerPreset(
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

		expect(preset).instanceOf(CheckerPreset);

		type check = ExpectType<
			GetCheckerPresetGeneric<typeof preset>,
			{
				checker: typeof isOdd;
				info: "odd";
				key: "number";
				response:
					| Response<200, "odd", undefined>
					| Response<422, "notOdd", undefined>;
			},
			"strict"
		>;
	});
});

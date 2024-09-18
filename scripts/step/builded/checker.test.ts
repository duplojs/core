import { Checker, CheckerStep, makeFloor, zod, type CheckerStepParams } from "../..";
import { Response } from "@scripts/response";
import { BuildedCheckerStep } from "./checker";
import { duploTest } from "@test/utils/duploTest";

describe("BuildedCheckerStep", () => {
	const checker = new Checker("test");
	checker.setOptions({
		toto: 1,
		test: "",
	});

	it("merge object options", () => {
		const params: CheckerStepParams = {
			input: () => ({}),
			catch: () => new Response(300, "test", 11),
			result: "",
			options: {
				toto: 2,
				test1: "&",
			},
		};

		const step = new CheckerStep(checker, params);

		const buildedCheckerStep = new BuildedCheckerStep(duploTest, step);

		expect(buildedCheckerStep.params.options).toStrictEqual({
			toto: 2,
			test: "",
			test1: "&",
		});

		expect(
			buildedCheckerStep.checkerFunction(
				1,
				(info, data) => ({
					info,
					data,
				}),
				{},
			),
		).toStrictEqual({
			info: "<([{|none|}])>",
			data: undefined,
		});
	});

	it("merge function options", () => {
		const params: CheckerStepParams = {
			input: () => ({}),
			catch: () => new Response(300, "test", 11),
			result: "",
			options: () => ({
				toto: 2,
				test1: "&",
			}),
		};

		const step = new CheckerStep(checker, params);

		const buildedCheckerStep = new BuildedCheckerStep(duploTest, step);

		expect(
			typeof buildedCheckerStep.params.options === "function"
				? buildedCheckerStep.params.options(makeFloor().pickup)
				: undefined,
		).toStrictEqual({
			toto: 2,
			test: "",
			test1: "&",
		});
	});

	it("toString options: function, result: string, indexing", async() => {
		const params: CheckerStepParams = {
			input: () => ({}),
			catch: () => new Response(300, "test", 11),
			result: "",
			indexing: "toto",
			options: () => ({
				toto: 2,
				test1: "&",
			}),
		};

		const step = new CheckerStep(checker, params, [new Response(100, "toto", zod.undefined())]);

		const buildedCheckerStep = new BuildedCheckerStep(duploTest, step);

		await expect(buildedCheckerStep.toString(1)).toMatchFileSnapshot("__data__/checker1.txt");
	});

	it("toString options: object, result: array", async() => {
		const params: CheckerStepParams = {
			input: () => ({}),
			catch: () => new Response(300, "test", 11),
			result: ["", "tot"],
			options: {
				toto: 2,
				test1: "&",
			},
			skip: () => true,
		};

		const step = new CheckerStep(checker, params, [new Response(100, "toto", zod.undefined())]);

		const buildedCheckerStep = new BuildedCheckerStep(duploTest, step);

		await expect(buildedCheckerStep.toString(1)).toMatchFileSnapshot("__data__/checker2.txt");
	});
});

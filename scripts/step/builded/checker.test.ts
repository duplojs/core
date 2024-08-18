import { Checker, CheckerStep, makeFloor, type CheckerStepParams } from "../..";
import { Response } from "@scripts/response";
import { BuildedCheckerStep } from "./checker";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

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

		const buildedCheckerStep = new BuildedCheckerStep(step);

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

		const buildedCheckerStep = new BuildedCheckerStep(step);

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

		const step = new CheckerStep(checker, params);

		const buildedCheckerStep = new BuildedCheckerStep(step);

		expect(buildedCheckerStep.toString(1)).toBe(
			await readFile(resolve(import.meta.dirname, "__data__/checker1.txt"), "utf-8"),
		);
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
		};

		const step = new CheckerStep(checker, params);

		const buildedCheckerStep = new BuildedCheckerStep(step);

		expect(buildedCheckerStep.toString(1)).toBe(
			await readFile(resolve(import.meta.dirname, "__data__/checker2.txt"), "utf-8"),
		);
	});
});

import { TestDescription } from "@test/utils/testDescription";
import {
	zod,
	Response,
	NotFoundHttpResponse,
	CheckerStep,
	makeFloor,
	type CurrentRequestObject,
	ProcessStep,
	CutStep,
	Process,
} from "..";
import type { ExpectType } from "@test/utils/expectType";
import { createProcessDefinition, manualChecker, manualPresetChecker, manualProcess } from "@test/utils/manualDuplose";
import { useProcessBuilder } from "./process";
import { ExtractStep } from "@scripts/step/extract";

describe("useProcessBuilder", () => {
	it("simple Route", () => {
		const description = new TestDescription();

		const process = useProcessBuilder(
			"test",
			{
				options: { test1: 3 } satisfies { test1: number },
				input: 2,
			},
		)
			.exportation(
				["input", "options"],
				description,
			);

		expect(process).instanceOf(Process);
		expect(process.definiton.descriptions[0]).toBe(description);
		expect(process.definiton.drop).toStrictEqual(["input", "options"]);
		expect(process.definiton.input).toBe(2);
		expect(process.definiton.options).toStrictEqual({ test1: 3 });
	});

	it("extract", () => {
		const description = new TestDescription();

		const process = useProcessBuilder("test")
			.extract(
				{
					params: {
						userId: zod.coerce.number(),
					},
					body: zod.object({
						test: zod.string(),
					}),
				},
				() => new Response(400, "invalid_body", undefined),
				description,
			)
			.cut(({ pickup, dropper }) => dropper({ test1: 1 }), ["test1"])
			.exportation(["body", "userId", "test1"]);

		expect(process.definiton.steps[0]).instanceOf(ExtractStep);
		expect(process.definiton.steps[0].descriptions[0]).toBe(description);
	});

	it("check", () => {
		const description1 = new TestDescription();
		const description2 = new TestDescription();

		const process = useProcessBuilder("test")
			.extract({
				params: {
					userId: zod.coerce.number(),
				},
			})
			.check(
				manualChecker,
				{
					input: (pickup) => {
						const userId = pickup("userId");

						type check1 = ExpectType<typeof userId, number, "strict">;

						return userId;
					},
					result: "test2",
					catch: () => new NotFoundHttpResponse("test.notfound", undefined),
					indexing: "result1",
					options: {
						test1: 1,
					},
				},
				new NotFoundHttpResponse("test.notfound", zod.undefined()),
				description1,
			)
			.presetCheck(
				manualPresetChecker,
				(pickup) => {
					const result1 = pickup("result1");

					type check1 = ExpectType<typeof result1, string, "strict">;

					return result1;
				},
				description2,
			)
			.check(
				manualChecker,
				{
					input: (pickup) => pickup("userId"),
					result: "test1",
					catch: () => new NotFoundHttpResponse("test.notfound", undefined),
					indexing: "result2",
					skip: (pickup) => {
						const userId = pickup("userId");

						type check1 = ExpectType<typeof userId, number, "strict">;

						return !!userId;
					},
				},
			)
			.exportation(["presetResult", "result2", "result1"]);

		expect(process.definiton.steps[1]).instanceOf(CheckerStep);
		expect(process.definiton.steps[1].descriptions[0]).toBe(description1);
		expect(process.definiton.steps[2]).instanceOf(CheckerStep);
		expect(process.definiton.steps[2].descriptions[0]).toBe(description2);
		expect(process.definiton.steps[3]).instanceOf(CheckerStep);

		const floor = makeFloor<{ result1: string }>();
		floor.drop("result1", "11");

		expect((process.definiton.steps[2] as CheckerStep).params.input(floor.pickup)).toBe(11);
	});

	it("execute", () => {
		const description1 = new TestDescription();
		const description2 = new TestDescription();

		const process = useProcessBuilder("test")
			.execute(
				manualProcess,
				{
					input: () => "toto",
					pickup: ["test1"],
					options: () => ({
						test1: 1,
					}),
				},
				description1,
			)
			.execute(
				manualProcess,
				{
					input: () => "toto",
					pickup: ["test2"],
					skip: (pickup) => {
						const test1 = pickup("test1");

						type check1 = ExpectType<typeof test1, string, "strict">;

						return !!test1;
					},
				},
				description2,
			)
			.exportation(["test1", "test2"]);

		expect(process.definiton.steps[0]).instanceOf(ProcessStep);
		expect((process.definiton.steps[0] as ProcessStep).descriptions[0]).toBe(description1);
		expect(process.definiton.steps[1]).instanceOf(ProcessStep);
		expect((process.definiton.steps[1] as ProcessStep).descriptions[0]).toBe(description2);
	});

	it("cut", () => {
		const description = new TestDescription();

		const process = useProcessBuilder(
			"test",
			{
				options: { test1: 3 },
				input: 2,
			},
		)
			.extract({
				params: {
					userId: zod.coerce.number(),
				},
			})
			.cut(
				({ pickup, dropper }, request) => {
					const userId = pickup("userId");
					const options = pickup("options");
					const input = pickup("input");

					type check1 = ExpectType<typeof userId, number, "strict">;

					type check2 = ExpectType<typeof options, { test1: number }, "strict">;

					type check3 = ExpectType<typeof input, number, "strict">;

					if (userId) {
						return new NotFoundHttpResponse("test.notfound", undefined);
					}

					return dropper({ toto: 56 });
				},
				["toto"],
				new NotFoundHttpResponse("test.notfound", zod.undefined()),
				description,
			)
			.cut(({ dropper }) => dropper({ ttt: "eee" }))
			.cut(({ dropper }) => dropper({}), [])
			.exportation(["input", "options"]);

		expect(process.definiton.steps[1]).instanceOf(CutStep);
		expect((process.definiton.steps[1] as CutStep).responses[0]).instanceOf(NotFoundHttpResponse);
		expect(process.definiton.steps[1].descriptions[0]).toBe(description);

		useProcessBuilder<
			CurrentRequestObject & { test: string }
		>("test")
			.extract({
				params: {
					userId: zod.coerce.number(),
				},
				test: zod.string(),
			})
			.cut(
				({ pickup, dropper }, request) => {
					type check1 = ExpectType<typeof request["test"], string, "strict">;

					type check2 = ExpectType<ReturnType<typeof pickup<"test">>, string, "strict">;

					type check3 = ExpectType<ReturnType<typeof pickup<"input">>, undefined, "strict">;

					type check4 = ExpectType<ReturnType<typeof pickup<"options">>, undefined, "strict">;

					return dropper({ toto: 56 });
				},
			)
			.exportation();
	});
});

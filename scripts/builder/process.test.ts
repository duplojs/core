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
import { manualChecker, manualPresetChecker, manualProcess } from "@test/utils/manualDuplose";
import { useProcessBuilder } from "./process";

describe("useProcessBuilder", () => {
	it("simple Route", () => {
		const description = new TestDescription();

		const process = useProcessBuilder(
			new Process("test"),
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
		expect(process.descriptions[0]).toBe(description);
		expect(process.drop).toStrictEqual(["input", "options"]);
		expect(process.input).toBe(2);
		expect(process.options).toStrictEqual({ test1: 3 });
	});

	it("extract", () => {
		const description = new TestDescription();

		const process = useProcessBuilder(new Process("test"))
			.extract(
				{
					params: {
						userId: zod.coerce.number(),
					},
					body: zod.object({
						test: zod.string(),
					}),
				},
				() => new Response(400, "invalide_body", undefined),
				description,
			)
			.exportation(["body", "userId"]);

		expect(Object.keys(process.extract ?? {})).toStrictEqual(["params", "body"]);
		expect(process.extractError).not.toBe(undefined);
		expect(process.descriptions[0]).toBe(description);
	});

	it("check", () => {
		const description1 = new TestDescription();
		const description2 = new TestDescription();

		const process = useProcessBuilder(new Process("test"))
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

		expect(process.steps[0]).instanceOf(CheckerStep);
		expect((process.steps[0] as CheckerStep).descriptions[0]).toBe(description1);
		expect(process.steps[1]).instanceOf(CheckerStep);
		expect((process.steps[1] as CheckerStep).descriptions[0]).toBe(description2);
		expect(process.steps[2]).instanceOf(CheckerStep);

		const floor = makeFloor<{ result1: string }>();
		floor.drop("result1", "11");

		expect((process.steps[1] as CheckerStep).params.input(floor.pickup)).toBe(11);
	});

	it("execute", () => {
		const description1 = new TestDescription();
		const description2 = new TestDescription();

		const process = useProcessBuilder(new Process("test"))
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

		expect(process.steps[0]).instanceOf(ProcessStep);
		expect((process.steps[0] as ProcessStep).descriptions[0]).toBe(description1);
		expect(process.steps[1]).instanceOf(ProcessStep);
		expect((process.steps[1] as ProcessStep).descriptions[0]).toBe(description2);
	});

	it("cut", () => {
		const description = new TestDescription();

		const process = useProcessBuilder(
			new Process("test"),
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
				({ pickup }, request) => {
					const userId = pickup("userId");
					const options = pickup("options");
					const input = pickup("input");

					type check1 = ExpectType<typeof userId, number, "strict">;

					type check2 = ExpectType<typeof options, { test1: number }, "strict">;

					type check3 = ExpectType<typeof input, number, "strict">;

					if (userId) {
						return new NotFoundHttpResponse("test.notfound", undefined);
					}

					return { toto: 56 };
				},
				["toto"],
				new NotFoundHttpResponse("test.notfound", zod.undefined()),
				description,
			)
			.cut(() => ({ ttt: "eee" }))
			.cut(() => ({}), [])
			.exportation(["input", "options"]);

		expect(process.steps[0]).instanceOf(CutStep);
		expect((process.steps[0] as CutStep).responses[0]).instanceOf(NotFoundHttpResponse);
		expect(process.steps[0].descriptions[0]).toBe(description);

		useProcessBuilder<
			CurrentRequestObject & { test: string }
		>(new Process("test"))
			.extract({
				params: {
					userId: zod.coerce.number(),
				},
			})
			.cut(
				({ pickup }, request) => {
					type check1 = ExpectType<typeof request["test"], string, "strict">;

					type check2 = ExpectType<ReturnType<typeof pickup<"input">>, undefined, "strict">;

					type check3 = ExpectType<ReturnType<typeof pickup<"options">>, undefined, "strict">;

					return { toto: 56 };
				},
			)
			.exportation();
	});
});

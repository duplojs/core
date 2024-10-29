import { TestDescription } from "@test/utils/testDescription";
import {
	OkHttpResponse,
	Route,
	zod,
	Response,
	NotFoundHttpResponse,
	CheckerStep,
	makeFloor,
	type CurrentRequestObject,
	ProcessStep,
	CutStep,
} from "..";
import { useRouteBuilder } from "./route";
import type { ExpectType } from "@test/utils/expectType";
import { HandlerStep } from "@scripts/step/handler";
import { manualChecker, manualPresetChecker, manualProcess } from "@test/utils/manualDuplose";
import { ExtractStep } from "@scripts/step/extract";

describe("useRouteBuilder", () => {
	it("simple Route", () => {
		const description = new TestDescription();

		const route = useRouteBuilder("GET", ["/"])
			.handler(
				() => new OkHttpResponse("test", ""),
				new OkHttpResponse("test", zod.string()),
				description,
			);

		expect(route).instanceOf(Route);
		expect(route.definiton.steps[0]).instanceOf(HandlerStep);
		expect((route.definiton.steps[0] as HandlerStep).responses[0]).instanceOf(OkHttpResponse);
		expect(route.definiton.steps[0].descriptions[0]).toBe(description);
	});

	it("extract", () => {
		const description = new TestDescription();

		const route = useRouteBuilder("GET", ["/"])
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
			.handler(
				(pickup) => {
					const userId = pickup("userId");

					type check1 = ExpectType<typeof userId, number, "strict">;

					const body = pickup("body");

					type check2 = ExpectType<typeof body, { test: string }, "strict">;

					const test1 = pickup("test1");

					type check3 = ExpectType<typeof test1, number, "strict">;

					return new OkHttpResponse("test", "");
				},
				new OkHttpResponse("test", zod.string()),
			);

		expect(route.definiton.steps[0]).instanceOf(ExtractStep);
		expect(route.definiton.steps[0].descriptions[0]).toBe(description);
	});

	it("check", () => {
		const description1 = new TestDescription();
		const description2 = new TestDescription();

		const route = useRouteBuilder("GET", ["/"])
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
			.handler(
				(pickup) => {
					const presetResult = pickup("presetResult");

					type check1 = ExpectType<typeof presetResult, number, "strict">;

					const result2 = pickup("result2");

					type check2 = ExpectType<typeof result2, number | undefined, "strict">;

					return new OkHttpResponse("test", "");
				},
				new OkHttpResponse("test", zod.string()),
			);

		expect(route.definiton.steps[1]).instanceOf(CheckerStep);
		expect((route.definiton.steps[1] as CheckerStep).descriptions[0]).toBe(description1);
		expect(route.definiton.steps[2]).instanceOf(CheckerStep);
		expect((route.definiton.steps[2] as CheckerStep).descriptions[0]).toBe(description2);
		expect(route.definiton.steps[3]).instanceOf(CheckerStep);

		const floor = makeFloor<{ result1: string }>();
		floor.drop("result1", "11");

		expect((route.definiton.steps[2] as CheckerStep).params.input(floor.pickup)).toBe(11);
	});

	it("execute", () => {
		const description1 = new TestDescription();
		const description2 = new TestDescription();

		const route = useRouteBuilder("GET", ["/"])
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
			.handler(
				(pickup, request) => {
					const test2 = pickup("test2");

					type check1 = ExpectType<typeof test2, number | undefined, "strict">;

					return new OkHttpResponse("test", "");
				},
				new OkHttpResponse("test", zod.string()),
			);

		expect(route.definiton.steps[0]).instanceOf(ProcessStep);
		expect((route.definiton.steps[0] as ProcessStep).descriptions[0]).toBe(description1);
		expect(route.definiton.steps[1]).instanceOf(ProcessStep);
		expect((route.definiton.steps[1] as ProcessStep).descriptions[0]).toBe(description2);
	});

	it("cut", () => {
		const description = new TestDescription();

		const route = useRouteBuilder<CurrentRequestObject & { test: string }>("GET", ["/"])
			.extract({
				params: {
					userId: zod.coerce.number(),
				},
				test: zod.string(),
			})
			.cut(
				({ pickup, dropper }, request) => {
					const userId = pickup("userId");

					type check1 = ExpectType<typeof userId, number, "strict">;

					type check2 = ExpectType<typeof request["test"], string, "strict">;

					type check3 = ExpectType<ReturnType<typeof pickup<"test">>, string, "strict">;

					if (userId) {
						return new NotFoundHttpResponse("test.notfound", undefined);
					}

					return dropper({
						toto: 56,
						ru: "rr",
					});
				},
				["toto"],
				new NotFoundHttpResponse("test.notfound", zod.undefined()),
				description,
			)
			.cut(({ dropper }) => dropper({ ttt: "eee" }))
			.cut(({ dropper }) => dropper(null), [])
			.handler(
				(pickup, request) => {
					const toto = pickup("toto");

					type check1 = ExpectType<typeof toto, number, "strict">;

					type check2 = ExpectType<typeof request["test"], string, "strict">;

					return new OkHttpResponse("test", "");
				},
				new OkHttpResponse("test", zod.string()),
				description,
			);

		expect(route.definiton.steps[1]).instanceOf(CutStep);
		expect((route.definiton.steps[1] as CutStep).responses[0]).instanceOf(NotFoundHttpResponse);
		expect(route.definiton.steps[1].descriptions[0]).toBe(description);
	});
});

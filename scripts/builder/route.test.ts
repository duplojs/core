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

describe("createRoute", () => {
	it("simple Route", () => {
		const description = new TestDescription();

		const route = useRouteBuilder(new Route("GET", ["/"]))
			.handler(
				() => new OkHttpResponse("test", ""),
				new OkHttpResponse("test", zod.string()),
				description,
			);

		expect(route).instanceOf(Route);
		expect(route.steps[0]).instanceOf(HandlerStep);
		expect((route.steps[0] as HandlerStep).responses[0]).instanceOf(OkHttpResponse);
		expect(route.steps[0].descriptions[0]).toBe(description);
	});

	it("extract", () => {
		const description = new TestDescription();

		const route = useRouteBuilder(new Route("GET", ["/"]))
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
			.handler(
				({ pickup }) => {
					const userId = pickup("userId");

					type check1 = ExpectType<typeof userId, number, "strict">;

					const body = pickup("body");

					type check2 = ExpectType<typeof body, { test: string }, "strict">;

					return new OkHttpResponse("test", "");
				},
				new OkHttpResponse("test", zod.string()),
			);

		expect(Object.keys(route.extract ?? {})).toStrictEqual(["params", "body"]);
		expect(route.extractError).not.toBe(undefined);
		expect(route.descriptions[0]).toBe(description);
	});

	it("check", () => {
		const description1 = new TestDescription();
		const description2 = new TestDescription();

		const route = useRouteBuilder(new Route("GET", ["/"]))
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
				({ pickup }) => {
					const presetResult = pickup("presetResult");

					type check1 = ExpectType<typeof presetResult, number, "strict">;

					const result2 = pickup("result2");

					type check2 = ExpectType<typeof result2, number | undefined, "strict">;

					return new OkHttpResponse("test", "");
				},
				new OkHttpResponse("test", zod.string()),
			);

		expect(route.steps[0]).instanceOf(CheckerStep);
		expect((route.steps[0] as CheckerStep).descriptions[0]).toBe(description1);
		expect(route.steps[1]).instanceOf(CheckerStep);
		expect((route.steps[1] as CheckerStep).descriptions[0]).toBe(description2);
		expect(route.steps[2]).instanceOf(CheckerStep);

		const floor = makeFloor<{ result1: string }>();
		floor.drop("result1", "11");

		expect((route.steps[1] as CheckerStep).params.input(floor.pickup)).toBe(11);
	});

	it("execute", () => {
		const description1 = new TestDescription();
		const description2 = new TestDescription();

		const route = useRouteBuilder(new Route("GET", ["/"]))
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
				({ pickup }, request) => {
					const test2 = pickup("test2");

					type check1 = ExpectType<typeof test2, number | undefined, "strict">;

					type check2 = ExpectType<typeof request, CurrentRequestObject & { test?: string }, "strict">;

					return new OkHttpResponse("test", "");
				},
				new OkHttpResponse("test", zod.string()),
			);

		expect(route.steps[0]).instanceOf(ProcessStep);
		expect((route.steps[0] as ProcessStep).descriptions[0]).toBe(description1);
		expect(route.steps[1]).instanceOf(ProcessStep);
		expect((route.steps[1] as ProcessStep).descriptions[0]).toBe(description2);
	});

	it("cut", () => {
		const description = new TestDescription();

		const route = useRouteBuilder<CurrentRequestObject & { test: string }>(new Route("GET", ["/"]))
			.extract({
				params: {
					userId: zod.coerce.number(),
				},
			})
			.cut(
				({ pickup }, request) => {
					const userId = pickup("userId");

					type check1 = ExpectType<typeof userId, number, "strict">;

					type check2 = ExpectType<typeof request, CurrentRequestObject & { test: string }, "strict">;

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
			.handler(
				({ pickup }, request) => {
					const toto = pickup("toto");

					type check1 = ExpectType<typeof toto, number, "strict">;

					type check2 = ExpectType<typeof request, CurrentRequestObject & { test: string }, "strict">;

					return new OkHttpResponse("test", "");
				},
				new OkHttpResponse("test", zod.string()),
				description,
			);

		expect(route.steps[0]).instanceOf(CutStep);
		expect((route.steps[0] as CutStep).responses[0]).instanceOf(NotFoundHttpResponse);
		expect(route.steps[0].descriptions[0]).toBe(description);
	});
});
import { manualProcess } from "@test/utils/manualDuplose";
import { useBuilder } from "./duplose";
import type { ExpectType } from "@test/utils/expectType";
import { TestDescription } from "@test/utils/testDescription";
import { OkHttpResponse } from "@scripts/response/simplePreset";
import { Process } from "@scripts/duplose/process";
import type { Duplose } from "@scripts/duplose";
import { zod } from "..";

describe("useBuilder", () => {
	it("preflight", () => {
		const description1 = new TestDescription();
		const description2 = new TestDescription();
		const description3 = new TestDescription();
		const description4 = new TestDescription();

		const builder = useBuilder()
			.preflight(
				manualProcess,
				{ pickup: ["test1"] },
				description1,
			)
			.preflight(
				manualProcess,
				{
					input: (pickup) => {
						const test1 = pickup("test1");

						type check = ExpectType<typeof test1, string, "strict">;

						return test1;
					},
					pickup: ["test2"],
					options: { test1: 1 },
				},
				description2,
			)
			.preflight(
				manualProcess,
				{
					input: (pickup) => {
						const test2 = pickup("test2");

						type check = ExpectType<typeof test2, number, "strict">;

						return test2.toString();
					},
					options: () => ({ test1: 1 }),
				},
				description3,
			)
			.preflight(manualProcess)
			.preflight(
				manualProcess,
				{
					options: (pickup) => {
						type check1 = ExpectType<ReturnType<typeof pickup<"test1">>, string, "strict">;
						type check2 = ExpectType<ReturnType<typeof pickup<"test2">>, number, "strict">;

						return {};
					},
				},
				description4,
			);

		expect(builder.preflightSteps[0].parent).toBe(manualProcess);
		expect(builder.preflightSteps[0].descriptions[0]).toBe(description1);
		expect(builder.preflightSteps[0].params).keys(["pickup"]);

		expect(builder.preflightSteps[1].parent).toBe(manualProcess);
		expect(builder.preflightSteps[1].descriptions[0]).toBe(description2);
		expect(builder.preflightSteps[1].params).keys(["input", "pickup", "options"]);

		expect(builder.preflightSteps[2].parent).toBe(manualProcess);
		expect(builder.preflightSteps[2].descriptions[0]).toBe(description3);
		expect(builder.preflightSteps[2].params).keys(["input", "options"]);

		expect(builder.preflightSteps[3].parent).toBe(manualProcess);
		expect(builder.preflightSteps[3].params).toStrictEqual({});

		expect(builder.preflightSteps[4].parent).toBe(manualProcess);
		expect(builder.preflightSteps[4].descriptions[0]).toBe(description4);
		expect(builder.preflightSteps[4].params).keys(["options"]);
	});

	it("create route", () => {
		const description1 = new TestDescription();

		const route = useBuilder()
			.preflight(
				manualProcess,
				{ pickup: ["test1"] },
			)
			.createRoute("GET", "/", description1)
			.handler((pickup) => {
				type check = ExpectType<ReturnType<typeof pickup<"test1">>, string, "strict">;

				return new OkHttpResponse("test", undefined);
			});

		expect(route.definiton.preflightSteps[0].parent).toBe(manualProcess);
		expect(route.definiton.descriptions[0]).toBe(description1);

		useBuilder()
			.createRoute("GET", "/")
			.extract({
				params: {
					userId: zod.string(),
				},
			})
			.handler((pickup) => {
				type check = ExpectType<ReturnType<typeof pickup<"userId">>, string, "strict">;

				return new OkHttpResponse("test", undefined);
			});
	});

	it("create process", () => {
		const description1 = new TestDescription();

		const process = useBuilder()
			.preflight(
				manualProcess,
				{ pickup: ["test1"] },
			)
			.createProcess("test", { options: { test: 1 } }, description1)
			.cut(({ pickup, dropper }) => {
				type check1 = ExpectType<ReturnType<typeof pickup<"test1">>, string, "strict">;
				type check2 = ExpectType<ReturnType<typeof pickup<"options">>, { test: number }, "strict">;

				return dropper({});
			})
			.exportation();

		expect(process.definiton.preflightSteps[0].parent).toBe(manualProcess);
		expect(process.definiton.descriptions[0]).toBe(description1);

		useBuilder()
			.createProcess("test")
			.cut(({ pickup, dropper }) => {
				type check2 = ExpectType<ReturnType<typeof pickup<"options">>, undefined, "strict">;

				return dropper({});
			})
			.exportation();
	});

	it("generator", () => {
		useBuilder.resetCreatedDuploses();
		function arrayDuploseToProcessName(duploses: Duplose[]) {
			return duploses
				.map((duplose) => duplose instanceof Process ? duplose.definiton.name : null)
				.filter((name): name is string => typeof name === "string");
		}

		useBuilder()
			.createProcess("test1")
			.exportation();

		useBuilder()
			.createProcess("test2")
			.exportation();

		expect(
			arrayDuploseToProcessName([...useBuilder.getFirstCreatedDuploses()]),
		).toStrictEqual([]);
		expect(
			arrayDuploseToProcessName([...useBuilder.getLastCreatedDuploses()]),
		).toStrictEqual(["test1", "test2"]);
		expect(
			arrayDuploseToProcessName([...useBuilder.getAllCreatedDuplose()]),
		).toStrictEqual(["test1", "test2"]);

		useBuilder()
			.createProcess("test3")
			.exportation();

		useBuilder()
			.createProcess("test4")
			.exportation();

		expect(
			arrayDuploseToProcessName([...useBuilder.getFirstCreatedDuploses()]),
		).toStrictEqual(["test1", "test2"]);
		expect(
			arrayDuploseToProcessName([...useBuilder.getLastCreatedDuploses()]),
		).toStrictEqual(["test3", "test4"]);
		expect(
			arrayDuploseToProcessName([...useBuilder.getAllCreatedDuplose()]),
		).toStrictEqual(["test1", "test2", "test3", "test4"]);

		useBuilder()
			.createProcess("test5")
			.exportation();

		expect(
			arrayDuploseToProcessName([...useBuilder.getAllCreatedDuplose()]),
		).toStrictEqual(["test1", "test2", "test3", "test4", "test5"]);
	});
});

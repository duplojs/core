import { type ExpectType } from "@duplojs/utils";
import { createChecker, createPresetChecker, OkHttpResponse, useBuilder, Response } from "@scripts/index";
import { CheckpointList } from "@test/utils/checkpointList";
import { duploTest } from "@test/utils/duploTest";
import { makeFakeRequest } from "@test/utils/request";

it("all execute", async() => {
	const checkPoint = new CheckpointList();

	const insertValuepreflight = useBuilder()
		.createProcess("insertValuepreflight")
		.cut(
			({ dropper }) => {
				checkPoint.addPoint("insertValuepreflight");

				return dropper({ value: <const>"mySuperValue" });
			},
			["value"],
		)
		.exportation(["value"]);

	const preflight1 = useBuilder()
		.createProcess("preflight1", { input: null as null | string })
		.cut(
			({ pickup, dropper }) => {
				const { input } = pickup(["input"]);

				checkPoint.addPoint(`preflight1 ${input}`);

				return dropper({ value: <const>"mySuperValue1" });
			},
			["value"],
		)
		.exportation(["value"]);

	const checker1 = createChecker("checker1")
		.handler(
			(input: string, output) => {
				checkPoint.addPoint(`checker1 ${input}`);

				return output("test", null);
			},
		);

	const presetChecker1 = createPresetChecker(
		checker1,
		{
			result: "test",
			catch: () => new Response(400, undefined, undefined),
		},
	);

	const checker2 = createChecker("checker2")
		.handler(
			(input: string, output) => {
				checkPoint.addPoint(`checker2 ${input}`);

				return output("test", null);
			},
		);

	const presetChecker2 = createPresetChecker(
		checker2,
		{
			result: "test",
			catch: () => new Response(400, undefined, undefined),
		},
	);

	const process1 = useBuilder()
		.createProcess("process1", { input: null as null | string })
		.cut(
			({ pickup, dropper }) => {
				const { input } = pickup(["input"]);

				checkPoint.addPoint(`process1 ${input}`);

				return dropper({ value: <const>"mySuperValue2" });
			},
			["value"],
		)
		.check(
			checker1,
			{
				input: (pickup) => {
					const { value } = pickup(["value"]);

					type check = ExpectType<
						typeof value,
						"mySuperValue2",
						"strict"
					>;

					return "mySuperValuePassToChecker1";
				},
				result: "test",
				catch: () => new Response(400, undefined, undefined),
			},
		)
		.presetCheck(
			presetChecker1,
			(pickup) => {
				const { value } = pickup(["value"]);

				type check = ExpectType<
					typeof value,
					"mySuperValue2",
					"strict"
				>;

				return "mySuperValuePassToPresetChecker1";
			},
		)
		.exportation(["value"]);

	const route = useBuilder()
		.preflight(insertValuepreflight, {
			pickup: ["value"],
		})
		.preflight(
			preflight1,
			{
				input: (pickup) => {
					const value = pickup("value");
					type check = ExpectType<
						typeof value,
						"mySuperValue",
						"strict"
					>;

					return value;
				},
				pickup: ["value"],
			},
		)
		.createRoute("GET", "/")
		.execute(
			process1,
			{
				input: (pickup) => {
					const value = pickup("value");
					type check = ExpectType<
						typeof value,
						"mySuperValue1",
						"strict"
					>;

					return value;
				},
				pickup: ["value"],
			},
		)
		.cut(
			({ pickup, dropper }) => {
				const { value } = pickup(["value"]);

				type check = ExpectType<
					typeof value,
					"mySuperValue2",
					"strict"
				>;

				checkPoint.addPoint(`route ${value}`);

				return dropper({ value: <const>"mySuperValue3" });
			},
			["value"],
		)
		.check(
			checker2,
			{
				input: (pickup) => {
					const { value } = pickup(["value"]);

					type check = ExpectType<
						typeof value,
						"mySuperValue3",
						"strict"
					>;

					return "mySuperValuePassToChecker2";
				},
				result: "test",
				catch: () => new Response(400, undefined, undefined),
			},
		)
		.presetCheck(
			presetChecker2,
			(pickup) => {
				const { value } = pickup(["value"]);

				type check = ExpectType<
					typeof value,
					"mySuperValue3",
					"strict"
				>;

				return "mySuperValuePassToPresetChecker2";
			},
		)
		.handler(
			(pickup) => {
				const { value } = pickup(["value"]);

				type check = ExpectType<
					typeof value,
					"mySuperValue3",
					"strict"
				>;

				checkPoint.addPoint(`route ${value}`);

				return new OkHttpResponse("OK");
			},
		);

	duploTest.register(...useBuilder.getAllCreatedDuplose());
	const buildedRoute = await route.build();
	const response = await buildedRoute(makeFakeRequest());

	expect(response).instanceOf(OkHttpResponse);
	expect(response.information).toBe("OK");

	expect(checkPoint.getPointList()).toStrictEqual([
		"start",
		"insertValuepreflight",
		"preflight1 mySuperValue",
		"process1 mySuperValue1",
		"checker1 mySuperValuePassToChecker1",
		"checker1 mySuperValuePassToPresetChecker1",
		"route mySuperValue2",
		"checker2 mySuperValuePassToChecker2",
		"checker2 mySuperValuePassToPresetChecker2",
		"route mySuperValue3",
		"end",
	]);
});

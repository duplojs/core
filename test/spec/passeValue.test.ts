import { OkHttpResponse, useBuilder } from "@scripts/index";
import { CheckpointList } from "@test/utils/checkpointList";
import { duploTest } from "@test/utils/duploTest";
import type { ExpectType } from "@test/utils/expectType";
import { makeFakeRequest } from "@test/utils/request";

it("passe value", async() => {
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
	const buildedRoute = route.build();
	const response = await buildedRoute(makeFakeRequest());

	expect(checkPoint.getPointList()).toStrictEqual([
		"start",
		"insertValuepreflight",
		"preflight1 mySuperValue",
		"process1 mySuperValue1",
		"route mySuperValue2",
		"route mySuperValue3",
		"end",
	]);
});

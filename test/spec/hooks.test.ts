import { Duplo, getTypedEntries, OkHttpResponse, useBuilder, zod } from "@scripts/index";
import { CheckpointList } from "@test/utils/checkpointList";
import { makeFakeRequest } from "@test/utils/request";

describe("life cycle hooks", async() => {
	const checkPoint = new CheckpointList();

	const deepPreflight1 = useBuilder()
		.createProcess("deepPreflight1")
		.exportation()
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("deepPreflight1 beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("deepPreflight1 parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("deepPreflight1 onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("deepPreflight1 beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("deepPreflight1 serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("deepPreflight1 afterSend"));

	const deepProcess1 = useBuilder()
		.createProcess("deepProcess")
		.exportation()
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("deepProcess1 beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("deepProcess1 parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("deepProcess1 onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("deepProcess1 beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("deepProcess1 serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("deepProcess1 afterSend"));

	const preflight = useBuilder()
		.preflight(deepPreflight1)
		.createProcess("process")
		.execute(deepProcess1)
		.exportation()
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("preflight beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("preflight parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("preflight onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("preflight beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("preflight serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("preflight afterSend"));

	const deepPreflight2 = useBuilder()
		.createProcess("deepPreflight2")
		.exportation()
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("deepPreflight2 beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("deepPreflight2 parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("deepPreflight2 onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("deepPreflight2 beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("deepPreflight2 serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("deepPreflight2 afterSend"));

	const deepProcess2 = useBuilder()
		.createProcess("deepProcess2")
		.exportation()
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("deepProcess2 beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("deepProcess2 parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("deepProcess2 onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("deepProcess2 beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("deepProcess2 serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("deepProcess2 afterSend"));

	const process = useBuilder()
		.preflight(deepPreflight2)
		.createProcess("process")
		.execute(deepProcess2)
		.exportation()
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("process beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("process parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("process onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("process beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("process serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("process afterSend"));

	const route = useBuilder()
		.preflight(preflight)
		.createRoute("POST", "/")
		.execute(process)
		.handler(() => {
			throw new Error();
		})
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("route beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("route parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("route onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("route beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("route serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("route afterSend"));

	const duplo = new Duplo({ environment: "TEST" });
	duplo.hooksRouteLifeCycle.beforeSend.subscribers = [];

	duplo
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("instance beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("instance parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("instance onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("instance beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("instance serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("instance afterSend"));

	duplo.register(...useBuilder.getAllCreatedDuplose());
	const buildedRoute = await route.build();

	beforeEach(() => {
		checkPoint.reset();
	});

	it("hooks", async() => {
		for (const [name, hook] of getTypedEntries(buildedRoute.context.hooks)) {
			checkPoint.reset();
			await hook(undefined as any, undefined as any);

			expect(checkPoint.getPointList()).toStrictEqual([
				"start",
				`route ${name}`,
				`process ${name}`,
				`deepProcess2 ${name}`,
				`deepPreflight2 ${name}`,
				`preflight ${name}`,
				`deepProcess1 ${name}`,
				`deepPreflight1 ${name}`,
				`instance ${name}`,
				"end",
			]);
		}
	});

	it("route life cycle", async() => {
		await buildedRoute(makeFakeRequest());

		expect(checkPoint.getPointList()).toStrictEqual([
			"start",
			"route beforeRouteExecution",
			"process beforeRouteExecution",
			"deepProcess2 beforeRouteExecution",
			"deepPreflight2 beforeRouteExecution",
			"preflight beforeRouteExecution",
			"deepProcess1 beforeRouteExecution",
			"deepPreflight1 beforeRouteExecution",
			"instance beforeRouteExecution",
			"route parsingBody",
			"process parsingBody",
			"deepProcess2 parsingBody",
			"deepPreflight2 parsingBody",
			"preflight parsingBody",
			"deepProcess1 parsingBody",
			"deepPreflight1 parsingBody",
			"instance parsingBody",
			"route onError",
			"process onError",
			"deepProcess2 onError",
			"deepPreflight2 onError",
			"preflight onError",
			"deepProcess1 onError",
			"deepPreflight1 onError",
			"instance onError",
			"end",
		]);
	});

	it("correct return response", async() => {
		const route = useBuilder()
			.preflight(preflight)
			.createRoute("POST", "/")
			.execute(process)
			.handler(() => {
				throw new Error();
			})
			.hook("beforeRouteExecution", (request) => request.params.type === "beforeRouteExecution" ? new OkHttpResponse(undefined, "beforeRouteExecution") : undefined)
			.hook("parsingBody", (request) => request.params.type === "parsingBody" ? new OkHttpResponse(undefined, "parsingBody") : undefined)
			.hook("onError", (request) => request.params.type === "onError" ? new OkHttpResponse(undefined, "onError") : undefined);

		duplo.register(route);

		const buildedRoute = await route.build();

		const result1 = await buildedRoute(makeFakeRequest({ params: { type: "beforeRouteExecution" } }));

		expect(result1.body).toBe("beforeRouteExecution");

		const result2 = await buildedRoute(makeFakeRequest({ params: { type: "parsingBody" } }));

		expect(result2.body).toBe("parsingBody");

		const result3 = await buildedRoute(makeFakeRequest({ params: { type: "onError" } }));

		expect(result3.body).toBe("onError");
	});
});

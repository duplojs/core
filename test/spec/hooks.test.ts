import { Duplo, getTypedEntries, useBuilder, zod } from "@scripts/index";
import { CheckpointList } from "@test/utils/checkpointList";
import { makeFakeRequest } from "@test/utils/request";

describe("life cycle hooks", () => {
	const checkPoint = new CheckpointList();

	const deepPreflight1 = useBuilder()
		.createProcess("deepPreflight1")
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("deepPreflight1 beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("deepPreflight1 parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("deepPreflight1 onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("deepPreflight1 beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("deepPreflight1 serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("deepPreflight1 afterSend"))
		.exportation();

	const deepProcess1 = useBuilder()
		.createProcess("deepProcess")
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("deepProcess1 beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("deepProcess1 parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("deepProcess1 onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("deepProcess1 beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("deepProcess1 serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("deepProcess1 afterSend"))
		.exportation();

	const preflight = useBuilder()
		.preflight(deepPreflight1)
		.createProcess("process")
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("preflight beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("preflight parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("preflight onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("preflight beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("preflight serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("preflight afterSend"))
		.execute(deepProcess1)
		.exportation();

	const deepPreflight2 = useBuilder()
		.createProcess("deepPreflight2")
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("deepPreflight2 beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("deepPreflight2 parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("deepPreflight2 onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("deepPreflight2 beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("deepPreflight2 serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("deepPreflight2 afterSend"))
		.exportation();

	const deepProcess2 = useBuilder()
		.createProcess("deepProcess2")
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("deepProcess2 beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("deepProcess2 parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("deepProcess2 onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("deepProcess2 beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("deepProcess2 serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("deepProcess2 afterSend"))
		.exportation();

	const process = useBuilder()
		.preflight(deepPreflight2)
		.createProcess("process")
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("process beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("process parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("process onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("process beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("process serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("process afterSend"))
		.execute(deepProcess2)
		.exportation();

	const route = useBuilder()
		.preflight(preflight)
		.createRoute("GET", "/")
		.hook("beforeRouteExecution", () => void checkPoint.addPoint("route beforeRouteExecution"))
		.hook("parsingBody", () => void checkPoint.addPoint("route parsingBody"))
		.hook("onError", () => void checkPoint.addPoint("route onError"))
		.hook("beforeSend", () => void checkPoint.addPoint("route beforeSend"))
		.hook("serializeBody", () => void checkPoint.addPoint("route serializeBody"))
		.hook("afterSend", () => void checkPoint.addPoint("route afterSend"))
		.extract({ body: zod.any() })
		.execute(process)
		.handler(() => {
			throw new Error();
		});

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
	const buildedRoute = route.build();

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
});

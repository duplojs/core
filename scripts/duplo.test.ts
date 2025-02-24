import { ZodError } from "zod";
import { Process } from "./duplose/process";
import { Response } from "@scripts/response";
import { Request } from "@scripts/request";
import { DuploTest } from "@test/utils/duploTest";
import { CheckpointList } from "@test/utils/checkpointList";
import { Duplo } from "./duplo";
import { createProcessDefinition } from "@test/utils/manualDuplose";
import { type AnyFunction } from "@duplojs/utils";

describe("duplo", () => {
	const duplo = new DuploTest({
		environment: "TEST",
		prefix: [],
	});

	it("register duplo", () => {
		const process = new Process(createProcessDefinition());
		duplo.register(process);

		expect(process.instance).toBe(duplo);
		expect(duplo.duploses[0]).toBe(process);
	});

	it("extractError", () => {
		const response = duplo.extractError("params", "userId", new ZodError([]));

		expect(response).instanceOf(Response);
		expect(response.code).toBe(422);
		expect(response.information).toBe("TYPE_ERROR.params.userId");
		expect(response.body).instanceOf(ZodError);

		const extractError = () => new Response(200, "test", undefined);
		duplo.setExtractError(extractError);

		expect(duplo.extractError).toBe(extractError);
	});

	it("notfoundHandler", () => {
		const response = duplo.notfoundHandler(new Request({} as any));

		expect(response).instanceOf(Response);
		expect(response.code).toBe(404);
		expect(response.information).toBe("NOTFOUND");

		const notfoundHandler = () => new Response(404, "55", undefined);
		duplo.setNotfoundHandler(notfoundHandler);

		expect(duplo.notfoundHandler).toBe(notfoundHandler);
	});

	it("hook", () => {
		const subscriber = () => void ({});

		duplo
			.hook("afterSend", subscriber)
			.hook("onHttpServerError", subscriber);

		expect(duplo.hooksRouteLifeCycle.afterSend.subscribers[0]).toBe(subscriber);
		expect(duplo.hooksInstanceLifeCycle.onHttpServerError.subscribers[0]).toBe(subscriber);
	});

	it("create router", async() => {
		const router = await duplo.start();
		const buildedRouter = await router.build();
		expect(router.notfoundRoutes.definiton.paths[0]).toBe("/*");
		expect(router.notfoundRoutes.definiton.method).toBe("GET");

		const response = await buildedRouter.buildedNotfoundRoutes(new Request({} as any));

		expect(response.code).toBe(404);
		expect(response.information).toBe("55");
	});

	it("plugins", () => {
		const checkpoint = new CheckpointList();

		new Duplo({
			environment: "TEST",
			plugins: [
				() => void checkpoint.addPoint("1"),
				() => void checkpoint.addPoint("2"),
			],
		});

		expect(checkpoint.getPointList()).toStrictEqual([
			"start",
			"1",
			"2",
			"end",
		]);
	});

	it("information hook is here", () => {
		const firstSubscriber: AnyFunction = duplo.hooksRouteLifeCycle.beforeSend.subscribers.at(0) as never;
		expect(
			firstSubscriber.name,
		).toBe("hookInformation");
	});

	it("global hook is here", () => {
		const firstSubscriber: AnyFunction = duplo.hooksInstanceLifeCycle.onRegistered.subscribers.at(0) as never;
		expect(
			firstSubscriber.name,
		).toBe("hookAddGlobalPrefix");
	});
});

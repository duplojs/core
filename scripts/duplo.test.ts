import { ZodError } from "zod";
import { Process } from "./duplose/process";
import { Response } from "@scripts/response";
import { Request } from "@scripts/request";
import { DuploTest } from "@test/utils/duploTest";
import { Router } from "./router";

describe("duplo", () => {
	const duplo = new DuploTest({ environment: "TEST" });

	it("register duplo", () => {
		const process = new Process("test");
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

		expect(router.notfoundRoutes.paths[0]).toBe("/*");
		expect(router.notfoundRoutes.method).toBe("GET");

		const response = await router.buildedNotfoundRoutes(new Request({} as any));

		expect(response.code).toBe(404);
		expect(response.information).toBe("55");
	});
});

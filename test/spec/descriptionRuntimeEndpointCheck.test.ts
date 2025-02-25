import { useBuilder } from "@scripts/builder";
import { ForceDisabledRuntimeEndPointCheck } from "@scripts/description/runtimeEndPointCheck/forceDisabled";
import { ForceEnabledRuntimeEndPointCheck } from "@scripts/description/runtimeEndPointCheck/forceEnabled";
import { makeResponseContract, OkHttpResponse } from "@scripts/index";
import { createDuploTest, duploTest } from "@test/utils/duploTest";
import { makeFakeRequest } from "@test/utils/request";

describe("descriptionRuntimeEndpointCheck", () => {
	it("enabled end point check", async() => {
		const route = useBuilder()
			.createRoute("GET", "/my-path")
			.handler(
				() => new OkHttpResponse("test"),
				makeResponseContract(OkHttpResponse, "toto" as string),
			);

		duploTest.register(route);

		const buildedRoute = await route.build();

		const response = await buildedRoute(makeFakeRequest());

		expect(response.code).toBe(503);
	});

	it("disabled end point check by config", async() => {
		const route = useBuilder()
			.createRoute("GET", "/my-path")
			.handler(
				() => new OkHttpResponse("test"),
				makeResponseContract(OkHttpResponse, "toto" as string),
			);

		createDuploTest({ disabledRuntimeEndPointCheck: true }).register(route);

		const buildedRoute = await route.build();

		const response = await buildedRoute(makeFakeRequest());

		expect(response.code).toBe(200);
	});

	it("disabled end point check by config but force by description", async() => {
		const route = useBuilder()
			.createRoute("GET", "/my-path")
			.handler(
				() => new OkHttpResponse("test"),
				makeResponseContract(OkHttpResponse, "toto" as string),
				new ForceEnabledRuntimeEndPointCheck(),
			);

		createDuploTest({ disabledRuntimeEndPointCheck: true }).register(route);

		const buildedRoute = await route.build();

		const response = await buildedRoute(makeFakeRequest());

		expect(response.code).toBe(503);
	});

	it("disabled end point check", async() => {
		const route = useBuilder()
			.createRoute("GET", "/my-path")
			.handler(
				() => new OkHttpResponse("test"),
				makeResponseContract(OkHttpResponse, "toto" as string),
				new ForceDisabledRuntimeEndPointCheck(),
			);

		duploTest.register(route);

		const buildedRoute = await route.build();

		const response = await buildedRoute(makeFakeRequest());

		expect(response.code).toBe(200);
	});
});

import { useBuilder } from "@scripts/builder";
import { ForceDisabledZodAccelerator } from "@scripts/description/zodAccelerator/forceDisabled";
import { ForceEnabledZodAccelerator } from "@scripts/description/zodAccelerator/forceEnabled";
import { type ContractResponseError, makeResponseContract, OkHttpResponse, zod, ZodAcceleratorError } from "@scripts/index";
import { createDuploTest, duploTest } from "@test/utils/duploTest";
import { makeFakeRequest } from "@test/utils/request";
import { ZodError } from "zod";

describe("descriptionZodAccelerator", () => {
	describe("on extract", () => {
		it("with zod accelerator", async() => {
			const route = useBuilder()
				.createRoute("GET", "/my-path")
				.extract({
					body: zod.object({}),
				})
				.handler(() => new OkHttpResponse("test"));

			duploTest.register(route);

			const buildedRoute = await route.build();

			const response = await buildedRoute(makeFakeRequest());

			expect(response.body).instanceof(ZodAcceleratorError);
		});

		it("disabled zod accelerator by config", async() => {
			const route = useBuilder()
				.createRoute("GET", "/my-path")
				.extract({
					body: zod.object({}),
				})
				.handler(() => new OkHttpResponse("test"));

			createDuploTest({ disabledZodAccelerator: true }).register(route);

			const buildedRoute = await route.build();

			const response = await buildedRoute(makeFakeRequest());

			expect(response.body).instanceof(ZodError);
		});

		it("disabled zod accelerator by config but force by description", async() => {
			const route = useBuilder()
				.createRoute("GET", "/my-path")
				.extract(
					{
						body: zod.object({}),
					},
					undefined,
					new ForceEnabledZodAccelerator(),
				)
				.handler(() => new OkHttpResponse("test"));

			createDuploTest({ disabledZodAccelerator: true }).register(route);

			const buildedRoute = await route.build();

			const response = await buildedRoute(makeFakeRequest());

			expect(response.body).instanceof(ZodAcceleratorError);
		});

		it("disabled zod accelerator by description", async() => {
			const route = useBuilder()
				.createRoute("GET", "/my-path")
				.extract({
					body: zod.object({}),
				}, undefined, new ForceDisabledZodAccelerator())
				.handler(() => new OkHttpResponse("test"));

			duploTest.register(route);

			const buildedRoute = await route.build();

			const response = await buildedRoute(makeFakeRequest());

			expect(response.body).instanceof(ZodError);
		});
	});

	describe("on response contract", () => {
		it("with zod accelerator", async() => {
			const route = useBuilder()
				.createRoute("GET", "/my-path")
				.handler(
					() => new OkHttpResponse("test"),
					makeResponseContract(OkHttpResponse, "toto" as string),
				);

			duploTest.register(route);

			const buildedRoute = await route.build();

			const response = await buildedRoute(makeFakeRequest());

			expect((<ContractResponseError>response.body).zodError).instanceof(ZodAcceleratorError);
		});

		it("disabled zod accelerator by config", async() => {
			const route = useBuilder()
				.createRoute("GET", "/my-path")
				.handler(
					() => new OkHttpResponse("test"),
					makeResponseContract(OkHttpResponse, "toto" as string),
				);

			createDuploTest({ disabledZodAccelerator: true }).register(route);

			const buildedRoute = await route.build();

			const response = await buildedRoute(makeFakeRequest());

			expect((<ContractResponseError>response.body).zodError).instanceof(ZodError);
		});

		it("disabled zod accelerator by config but force by description", async() => {
			const route = useBuilder()
				.createRoute("GET", "/my-path")
				.handler(
					() => new OkHttpResponse("test"),
					makeResponseContract(OkHttpResponse, "toto" as string),
					new ForceEnabledZodAccelerator(),
				);

			createDuploTest({ disabledZodAccelerator: true }).register(route);

			const buildedRoute = await route.build();

			const response = await buildedRoute(makeFakeRequest());

			expect((<ContractResponseError>response.body).zodError).instanceof(ZodAcceleratorError);
		});

		it("disabled zod accelerator by description", async() => {
			const route = useBuilder()
				.createRoute("GET", "/my-path")
				.handler(
					() => new OkHttpResponse("test"),
					makeResponseContract(OkHttpResponse, "toto" as string),
				);

			duploTest.register(route);

			const buildedRoute = await route.build();

			const response = await buildedRoute(makeFakeRequest());

			expect((<ContractResponseError>response.body).zodError).instanceof(ZodError);
		});
	});
});

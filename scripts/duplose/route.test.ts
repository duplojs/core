import { Process } from "./process";
import {
	BuildNoRegisteredDuploseError,
	CutStep,
	Duplose,
	getTypedEntries,
	Hook,
	LastStepMustBeHandlerError,
	OkHttpResponse,
	zod,
	type AnyFunction,
	type Floor,
} from "..";
import { Route } from "./route";
import { Request } from "@scripts/request";
import { PreflightStep } from "@scripts/step/preflight";
import { HandlerStep } from "@scripts/step/handler";
import { Response } from "@scripts/response";
import { CheckpointList } from "@test/utils/checkpointList";
import { DuploTest } from "@test/utils/duploTest";
import { createProcessDefinition, createRouteDefinition } from "@test/utils/manualDuplose";
import { ExtractStep } from "@scripts/step/extract";

describe("Route", () => {
	const checkpointList = new CheckpointList();
	const duplo = new DuploTest({ environment: "TEST" });

	const preflightProcess = new Process(createProcessDefinition());
	preflightProcess.instance = duplo;
	const preflight = new PreflightStep(preflightProcess, { pickup: ["flute"] as any });
	const extractStep = new ExtractStep(
		{
			params: { userId: zod.coerce.number() },
			body: zod.object({
				test: zod.string(),
			}).optional(),
		},
	);
	const cutStep = new CutStep(
		({ dropper }) => {
			checkpointList.addPoint("cut");
			return dropper({ toto: "true" });
		},
		["toto"],
		[new Response(100, "toto", zod.undefined())],
	);

	const route = new Route(createRouteDefinition({
		method: "POST",
		preflightSteps: [preflight],
		steps: [extractStep, cutStep],
	}));

	it("getAllHooks", () => {
		const hooks = route.getAllHooks();

		getTypedEntries(hooks)
			.forEach(([key, value]) => {
				if (!(value instanceof Hook)) {
					return;
				}

				expect(value.subscribers[0])
					.toBe(route.hooks[key]);

				expect((value.subscribers[1] as Hook).subscribers[0])
					.toBe(preflightProcess.hooks[key]);
			});
	});

	it("hasDuplose", () => {
		expect(route.hasDuplose(new Process(createProcessDefinition()))).toBe(false);
		expect(route.hasDuplose(route)).toBe(true);
		expect(route.hasDuplose(preflightProcess)).toBe(true);
	});

	it("build", async() => {
		const spy = vi.spyOn(Duplose.defaultEvaler, "makeFunction");
		checkpointList.reset();

		await expect(() => route.build()).rejects.toThrowError(BuildNoRegisteredDuploseError);

		route.instance = duplo;

		await expect(() => route.build()).rejects.toThrowError(LastStepMustBeHandlerError);

		const handlerStep = new HandlerStep(
			(
				(
					pickup: Floor<{
						toto: string;
						userId: number;
					}>["pickup"],
				) => new OkHttpResponse(pickup("toto"), pickup("userId"))
			) as AnyFunction,
		);
		route.definiton.steps.push(handlerStep);

		await route.build();

		expect(spy).toBeCalled();

		expect(spy.mock.lastCall?.[0].content).toMatchSnapshot();

		route.hooks.onError.addSubscriber((_request, error) => {
			checkpointList.addPoint("onError");
			throw error;
		});

		route.hooks.beforeSend.addSubscriber((_request, response) => {
			checkpointList.addPoint("beforeSend");
			expect(response.code).toBe(200);
			expect(response.information).toBe("true");
			expect(response.body).toBe(2);
		});

		const routeFunction = await route.build();

		await routeFunction(new Request({ params: { userId: "2" } } as any));

		expect(checkpointList.getPointList()).toStrictEqual([
			"start",
			"cut",
			"end",
		]);
	});
});

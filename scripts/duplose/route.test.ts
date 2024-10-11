import { Process } from "./process";
import {
	BuildNoRegisteredDuploseError,
	CutStep,
	Duplose,
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

describe("Route", () => {
	const checkpointList = new CheckpointList();
	const duplo = new DuploTest({ environment: "TEST" });

	const route = new Route("GET", ["/"]);
	route.setExtract({
		params: { userId: zod.coerce.number() },
		body: zod.object({
			test: zod.string(),
		}).optional(),
	});
	const step = new CutStep(
		({ dropper }) => {
			checkpointList.addPoint("cut");
			return dropper({ toto: "true" });
		},
		["toto"],
		[new Response(100, "toto", zod.undefined())],
	);
	route.addStep(step);
	const preflightProcess = new Process("preflightProcess");
	preflightProcess.instance = duplo;
	const preflight = new PreflightStep(preflightProcess, { pickup: ["flute"] as any });
	route.addPreflightSteps(preflight);

	it("constructor props", () => {
		expect(route.method).toBe("GET");
		expect(route.paths).toStrictEqual(["/"]);
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
		route.addStep(handlerStep);

		await route.build();

		expect(spy).toBeCalled();

		await expect(spy.mock.lastCall?.[0].content)
			.toMatchFileSnapshot("__data__/route.txt");

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

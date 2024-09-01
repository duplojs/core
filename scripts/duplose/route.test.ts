import { advancedEval } from "@utils/advancedEval";
import { readFile } from "fs/promises";
import { Process } from "./process";
import { resolve } from "path";
import { Duplo } from "@scripts/duplo";
import {
	BuildNoRegisteredDuploseError,
	CutStep,
	LastStepMustBeHandlerError,
	OkHttpResponse,
	Route,
	zod,
	type AnyFunction,
	type Floor,
} from "..";
import { Request } from "@scripts/request";
import { PreflightStep } from "@scripts/step/preflight";
import { HandlerStep } from "@scripts/step/handler";
import { Response } from "@scripts/response";
import { CheckpointList } from "@test/utils/checkpointList";
import { mokeAdvancedEval } from "@test/utils/mokeAdvancedEval";

describe("Route", async() => {
	const checkpointList = new CheckpointList();
	const duplo = new Duplo();
	const route = new Route("GET", ["/"]);
	route.setExtract({
		params: { userId: zod.coerce.number() },
		body: zod.object({
			test: zod.string(),
		}).optional(),
	});
	const step = new CutStep(
		() => {
			checkpointList.addPoint("cut");
			return { toto: "true" };
		},
		["toto"],
		[new Response(100, "toto", zod.undefined())],
	);
	route.addStep(step);
	const preflightProcess = new Process("preflightProcess");
	preflightProcess.instance = duplo;
	const preflight = new PreflightStep(preflightProcess, { pickup: ["flute"] as any });
	route.addPreflightSteps(preflight);

	const {
		advancedEval: spy,
		advancedEvalOriginal,
	} = await mokeAdvancedEval();

	it("constructor props", () => {
		expect(route.method).toBe("GET");
		expect(route.paths).toStrictEqual(["/"]);
	});

	it("build", async() => {
		checkpointList.reset();

		expect(() => route.build()).toThrowError(BuildNoRegisteredDuploseError);

		route.instance = duplo;

		expect(() => route.build()).toThrowError(LastStepMustBeHandlerError);

		const handlerStep = new HandlerStep(
			(
				(
					{ pickup }: Floor<{
						toto: string;
						userId: number;
					}>,
				) => new OkHttpResponse(pickup("toto"), pickup("userId"))
			) as AnyFunction,
		);
		route.addStep(handlerStep);

		spy.mockImplementation(async(arg) => {
			// await writeFile(resolve(import.meta.dirname, "__data__/route.txt"), arg.content);
			expect(arg.content).toBe(
				await readFile(resolve(import.meta.dirname, "__data__/route.txt"), "utf-8"),
			);
		});

		await Promise.resolve(route.build());

		spy.mockImplementation(advancedEvalOriginal);

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

		const routeFunction = route.build();

		await routeFunction(new Request({ params: { userId: "2" } } as any));

		expect(checkpointList.getPointList()).toStrictEqual([
			"start",
			"cut",
			"beforeSend",
			"end",
		]);
	});
});

import { advancedEval } from "@utils/advancedEval";
import { readFile, writeFile } from "fs/promises";
import { Process } from "./process";
import { resolve } from "path";
import { Duplo } from "@scripts/duplo";
import { BuildNoRegisteredDuploseError, CutStep, LastStepMustBeHandlerError, OkHttpResponse, Route, zod } from "..";
import type { Mock } from "vitest";
import { Request } from "@scripts/request";
import { PreflightStep } from "@scripts/step/preflight";
import { HandlerStep } from "@scripts/step/handler";

vi.mock("@utils/advancedEval", async(original) => ({
	advancedEval: vi.fn(),
	advancedEvalOriginal: (await original<{ advancedEval: unknown }>()).advancedEval,
}));

describe("Route", async() => {
	const duplo = new Duplo();
	const route = new Route("GET", ["/"]);
	route.setExtract({
		params: { userId: zod.coerce.number() },
		body: zod.object({
			test: zod.string(),
		}).optional(),
	});
	const step = new CutStep(() => ({ toto: "true" }), ["toto"]);
	route.addStep(step);
	const preflightProcess = new Process("preflightProcess");
	preflightProcess.instance = duplo;
	const preflight = new PreflightStep(preflightProcess, { pickup: ["flute"] as any });
	route.addPreflightSteps(preflight);

	const spy = advancedEval as Mock;
	const { advancedEvalOriginal } = (await import("@utils/advancedEval")) as any as { advancedEvalOriginal: typeof advancedEval };

	it("constructor props", () => {
		expect(route.method).toBe("GET");
		expect(route.paths).toStrictEqual(["/"]);
	});

	it("build", async() => {
		expect(() => route.build()).toThrowError(BuildNoRegisteredDuploseError);

		route.instance = duplo;

		expect(() => route.build()).toThrowError(LastStepMustBeHandlerError);

		const handlerStep = new HandlerStep(({ pickup }) => new OkHttpResponse(pickup("toto" as never), pickup("userId" as never)));
		route.addStep(handlerStep);

		spy.mockImplementation(async(arg) => {
			expect(arg.content).toBe(
				await readFile(resolve(import.meta.dirname, "__data__/route.txt"), "utf-8"),
			);
		});

		await Promise.resolve(route.build());

		spy.mockImplementation(advancedEvalOriginal);

		route.hooks.onError.addSubscriber((_request, error) => {
			throw error;
		});

		route.hooks.beforeSend.addSubscriber((_request, response) => {
			expect(response.code).toBe(200);
			expect(response.information).toBe("true");
			expect(response.body).toBe(2);
		});

		const routeFunction = route.build();

		await routeFunction(new Request({ params: { userId: "2" } } as any));
	});
});

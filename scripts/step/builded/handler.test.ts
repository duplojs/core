import { BuildedHandlerStep } from "./handler";
import { HandlerStep } from "../handler";
import { Response } from "@scripts/response";
import { zod } from "@scripts/zod";
import { duploTest } from "@test/utils/duploTest";

it("BuildedHandlerStep", async() => {
	const handlerFunction = () => new Response(300, "test", 11);

	const step = new HandlerStep(handlerFunction, [new Response(100, "toto", zod.undefined())]);
	const buildedCutStep = new BuildedHandlerStep(duploTest, step);

	expect(buildedCutStep.step).toBe(step);

	expect(buildedCutStep.handlerFunction).toBe(handlerFunction);

	await expect(buildedCutStep.toString(4)).toMatchFileSnapshot("__data__/handler.txt");
});

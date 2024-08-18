import { BuildedHandlerStep } from "./builded/handler";
import { HandlerStep } from "./handler";
import { Response } from "@scripts/response";

it("HandlerStep", () => {
	const handlerFunction = () => new Response(300, "test", 11);

	const step = new HandlerStep(handlerFunction);

	expect(step.parent).toBe(handlerFunction);

	expect(step.build()).instanceOf(BuildedHandlerStep);
});

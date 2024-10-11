import { duploTest } from "@test/utils/duploTest";
import { BuildedHandlerStep } from "./builded/handler";
import { HandlerStep } from "./handler";
import { Response } from "@scripts/response";

it("HandlerStep", async() => {
	const handlerFunction = () => new Response(300, "test", 11);

	const step = new HandlerStep(handlerFunction);

	expect(step.parent).toBe(handlerFunction);

	expect(await step.build(duploTest)).instanceOf(BuildedHandlerStep);
});

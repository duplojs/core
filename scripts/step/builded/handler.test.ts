import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { BuildedHandlerStep } from "./handler";
import { HandlerStep } from "../handler";
import { Response } from "@scripts/response";

it("BuildedHandlerStep", async() => {
	const handlerFunction = () => new Response(300, "test", 11);

	const step = new HandlerStep(handlerFunction, ["test"]);
	const buildedCutStep = new BuildedHandlerStep(step);

	expect(buildedCutStep.step).toBe(step);

	expect(buildedCutStep.handlerFunction).toBe(handlerFunction);

	expect(buildedCutStep.toString(4)).toBe(
		await readFile(resolve(import.meta.dirname, "__data__/handler.txt"), "utf-8"),
	);
});

import { readFile } from "fs/promises";
import { CutStep } from "../cut";
import { BuildedCutStep } from "./cut";
import { Response } from "@scripts/response";
import { resolve } from "path";
import { zod } from "@scripts/index";

it("BuildedCutStep", async() => {
	const cutFunction = () => ({});

	const step = new CutStep(cutFunction, ["test"], [new Response(100, "toto", zod.undefined())]);
	const buildedCutStep = new BuildedCutStep(step);

	expect(buildedCutStep.step).toBe(step);

	expect(buildedCutStep.cutFunction).toBe(cutFunction);

	expect(buildedCutStep.drop).toStrictEqual(["test"]);

	expect(buildedCutStep.toString(2)).toBe(
		await readFile(resolve(import.meta.dirname, "__data__/cut.txt"), "utf-8"),
	);
});

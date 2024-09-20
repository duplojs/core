import { mokeAdvancedEval } from "@test/utils/mokeAdvancedEval";
import { Process } from "./process";
import { BuildNoRegisteredDuploseError, CutStep, zod } from "..";
import { Request } from "@scripts/request";
import { PreflightStep } from "@scripts/step/preflight";
import { Response } from "@scripts/response";
import { CheckpointList } from "@test/utils/checkpointList";
import { DuploTest } from "@test/utils/duploTest";

describe("Process", async() => {
	const checkpointList = new CheckpointList();
	const duplo = new DuploTest({ environment: "TEST" });
	const process = new Process("test");
	process.setExtract({
		params: { userId: zod.coerce.number() },
	});
	const step = new CutStep(
		({ dropper }) => {
			checkpointList.addPoint("cut");
			return dropper({ toto: "true" });
		},
		["toto"],
		[new Response(100, "toto", zod.undefined())],
	);
	process.addStep(step);
	const preflightProcess = new Process("preflightProcess");
	preflightProcess.instance = duplo;
	const preflight = new PreflightStep(preflightProcess, { pickup: ["flute"] as any });
	process.addPreflightSteps(preflight);

	const {
		advancedEval: spy,
		advancedEvalOriginal,
	} = await mokeAdvancedEval();

	it("name", () => {
		expect(process.name).toBe("test");
	});

	it("setInput", () => {
		process.setInput(1);

		expect(process.input).toBe(1);
	});

	it("setOptions", () => {
		const options = {};
		process.setOptions(options);

		expect(process.options).toBe(options);
	});

	it("setDrop", () => {
		const drop: string[] = ["toto", "userId"];
		process.setDrop(drop);

		expect(process.drop).toBe(drop);
	});

	it("build", async() => {
		checkpointList.reset();

		expect(() => process.build()).toThrowError(BuildNoRegisteredDuploseError);

		process.instance = duplo;

		process.build();

		expect(spy).toBeCalled();

		await expect(spy.mock.lastCall?.[0].content)
			.toMatchFileSnapshot("__data__/process.txt");

		spy.mockImplementation(advancedEvalOriginal);

		const processFunction = process.build();

		expect(processFunction(new Request({ params: { userId: "2" } } as any))).toStrictEqual({
			toto: "true",
			userId: 2,
		});

		expect(checkpointList.getPointList()).toStrictEqual([
			"start",
			"cut",
			"end",
		]);
	});
});

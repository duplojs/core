import { Process } from "./process";
import { BuildNoRegisteredDuploseError, CutStep, Duplose, Hook, zod } from "..";
import { Request } from "@scripts/request";
import { PreflightStep } from "@scripts/step/preflight";
import { Response } from "@scripts/response";
import { CheckpointList } from "@test/utils/checkpointList";
import { DuploTest } from "@test/utils/duploTest";
import { createProcessDefinition } from "@test/utils/manualDuplose";
import { ExtractStep } from "@scripts/step/extract";
import { getTypedEntries } from "@duplojs/utils";

describe("Process", () => {
	const checkpointList = new CheckpointList();
	const duplo = new DuploTest({ environment: "TEST" });

	const preflightProcess = new Process(createProcessDefinition({}));
	preflightProcess.instance = duplo;
	const preflight = new PreflightStep(preflightProcess, { pickup: ["flute"] as any });
	const cutStep = new CutStep(
		({ dropper }) => {
			checkpointList.addPoint("cut");
			return dropper({ toto: "true" });
		},
		["toto"],
		[new Response(100, "toto", zod.undefined())],
	);
	const extractStep = new ExtractStep(
		{
			params: {
				userId: zod.coerce.number(),
			},
		},
	);

	const process = new Process(createProcessDefinition({
		steps: [cutStep, extractStep],
		preflightSteps: [preflight],
		drop: ["toto", "userId"],
		name: "test",
	}));

	it("name", () => {
		expect(process.definiton.name).toBe("test");
	});

	it("getAllHooks", () => {
		const hooks = process.getAllHooks();

		getTypedEntries(hooks)
			.forEach(([key, value]) => {
				if (!(value instanceof Hook)) {
					return;
				}

				expect(value.subscribers[0])
					.toBe(process.hooks[key]);

				expect((value.subscribers[1] as Hook).subscribers[0])
					.toBe(preflightProcess.hooks[key]);
			});
	});

	it("hasDuplose", () => {
		expect(process.hasDuplose(new Process(createProcessDefinition()))).toBe(false);
		expect(process.hasDuplose(process)).toBe(true);
		expect(process.hasDuplose(preflightProcess)).toBe(true);
	});

	it("build", async() => {
		checkpointList.reset();
		const spy = vi.spyOn(Duplose.defaultEvaler, "makeFunction");

		await expect(() => process.build()).rejects.toThrowError(BuildNoRegisteredDuploseError);

		process.instance = duplo;

		await process.build();

		expect(spy).toBeCalled();

		expect(spy.mock.lastCall?.[0].content).toMatchSnapshot();

		const processFunction = await process.build();

		expect(processFunction(new Request({ params: { userId: "2" } } as any), undefined, undefined)).toStrictEqual({
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

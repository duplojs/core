import { Checker, type CheckerOutput } from "@scripts/checker";
import { Process } from "@scripts/duplose/process";
import { zod, type ZodSpace } from "@scripts/parser";
import { PresetChecker } from "@scripts/builder/checker";
import { BadRequestHttpResponse } from "@scripts/response/simplePreset";
import type { CurrentRequestObject } from "@scripts/request";
import type { Step } from "@scripts/step";
import type { Description, PreflightStep, ProcessDefinition } from "@scripts/index";

export const manualChecker = new Checker<
	{ test1: number },
	number,
	CheckerOutput<"test1", number>
	| CheckerOutput<"test2", string>
>("manualChecker");
manualChecker.handler = () => ({
	info: "",
	data: undefined,
});

export const manualPresetChecker = new PresetChecker<
	typeof manualChecker,
	"test1",
	"presetResult",
	BadRequestHttpResponse<string | undefined, ZodSpace.ZodType>,
	string
>(
	manualChecker,
	{
		transformInput: (input: string) => Number(input),
		result: "test1",
		catch: () => new BadRequestHttpResponse("bad", undefined),
		indexing: "presetResult",
	},
	[new BadRequestHttpResponse("bad", zod.undefined())],
);

interface ManualProcessDefiniton {
	name: string;
	options: { test1: number };
	input: string;
	drop: ("test1" | "test2")[];
	preflightSteps: PreflightStep[];
	steps: Step[];
	descriptions: Description[];
}

export const manualProcess = new Process<
	ManualProcessDefiniton,
	CurrentRequestObject & { test?: string },
	{
		test1: string;
		test2: number;
	}
>({
	preflightSteps: [],
	steps: [],
	descriptions: [],
	name: "manualProcess",
	options: { test1: 1 },
	input: "test",
	drop: ["test1", "test2"],
});

export function createProcessDefinition(processDefinition?: Partial<ProcessDefinition>): ProcessDefinition {
	return {
		name: "manualProcessDefiniton",
		options: { test1: 1 },
		input: "test",
		drop: ["test1", "test2"],
		preflightSteps: [],
		steps: [],
		descriptions: [],
		...processDefinition,
	};
}

import { Checker, type CheckerOutput } from "@scripts/checker";
import { Process } from "@scripts/duplose/process";
import { zod, type zodSpace } from "@scripts/parser";
import { PresetChecker } from "@scripts/builder/checker";
import { BadRequestHttpResponse } from "@scripts/response/simplePreset";
import type { CurrentRequestObject } from "@scripts/request";

export const manualChecker = new Checker<
	{ test1: number },
	number,
	CheckerOutput<"test1", number>
	| CheckerOutput<"test2", string>
>("manualChecker");

export const manualPresetChecker = new PresetChecker<
	typeof manualChecker,
	"test1",
	"presetResult",
	BadRequestHttpResponse<string | undefined, zodSpace.ZodType>,
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

export const manualProcess = new Process<
	CurrentRequestObject & { test?: string },
	{ test1: number },
	string,
	"test1" | "test2",
	never,
	{ params: zodSpace.ZodString },
	never,
	{
		test1: string;
		test2: number;
	}
>("manualProcess");

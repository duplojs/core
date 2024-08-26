import { Checker, type CheckerOutput } from "@scripts/checker";
import { Process } from "@scripts/duplose/process";
import { zod } from "@scripts/index";
import { PresetChecker } from "@scripts/builder/checker";
import { BadRequestHttpResponse } from "@scripts/response/simplePreset";
import type { CurrentRequestObject } from "@scripts/request";
import type { ZodString } from "zod";

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
	BadRequestHttpResponse,
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
	{ params: ZodString },
	never,
	{
		test1: string;
		test2: number;
	}
>("manualProcess");

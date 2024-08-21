import { Process } from "@scripts/duplose/process";
import type { CurrentRequestObject } from "@scripts/request";
import type { BadRequestHttpResponse } from "@scripts/response/simplePreset";
import type { Step } from "@scripts/step";
import type { PreflightStep } from "@scripts/step/preflight";
import type { ZodString } from "zod";
import { useBuilder } from "./duplose";

const testProcess = new Process<
	CurrentRequestObject,
	{ test: string },
	number,
	"dropedValue",
	PreflightStep,
	{ body: { dropedValue: ZodString } },
	Step,
	{ dropedValue: string },
	BadRequestHttpResponse<"toto", string>
>("test");

const tt = useBuilder()
	.preflight(
		testProcess,
		{
			pickup: ["dropedValue"],
		},
	)
	.preflight(
		testProcess,
		{
			pickup: ["dropedValue"],
			skip: (pickup) => !!pickup("dropedValue"),
		},
	);

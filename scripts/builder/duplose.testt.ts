import { Process } from "@scripts/duplose/process";
import type { CurrentRequestObject } from "@scripts/request";
import type { Step } from "@scripts/step";
import type { PreflightStep } from "@scripts/step/preflight";
import type { ZodString } from "zod";
import { useBuilder } from "./duplose";

describe("useBuilder", () => {

});

const testProcess = new Process<
	CurrentRequestObject,
	{ test: string },
	number,
	"dropedValue",
	PreflightStep,
	{ body: { dropedValue: ZodString } },
	Step,
	{ dropedValue: string }
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

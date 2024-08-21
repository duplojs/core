import type { Process } from "@scripts/duplose/process";
import { BuildedPreflightStep } from "./builded/preflight";
import { ProcessStep } from "./process";

export class PreflightStep<
	CurrentProcess extends Process = Process,
	_StepNumber extends number = number,
> extends ProcessStep<CurrentProcess, _StepNumber> {
	public override build(): BuildedPreflightStep {
		return new BuildedPreflightStep(this);
	}
}

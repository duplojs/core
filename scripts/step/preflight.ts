import type { Process } from "@scripts/duplose/process";
import { BuildedPreflightStep } from "./builded/preflight";
import { ProcessStep } from "./process";
import { type Duplo } from "@scripts/duplo";

export class PreflightStep<
	CurrentProcess extends Process = Process,
	_StepNumber extends number = number,
> extends ProcessStep<CurrentProcess, _StepNumber> {
	public override build(instance: Duplo): BuildedPreflightStep {
		return new BuildedPreflightStep(instance, this);
	}
}

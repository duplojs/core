import { BuildedPreflightStep } from "./builded/preflight";
import { ProcessStep } from "./process";

export class PreflightStep<
	_StepNumber extends number = number,
> extends ProcessStep<_StepNumber> {
	public override build(): BuildedPreflightStep {
		return new BuildedPreflightStep(this);
	}
}

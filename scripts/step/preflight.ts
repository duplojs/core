import type { Process, ProcessBuildedFunction } from "@scripts/duplose/process";
import { BuildedPreflightStep } from "./builded/preflight";
import { ProcessStep } from "./process";
import { type Duplo } from "@scripts/duplo";

export class PreflightStep<
	CurrentProcess extends Process = Process,
	_StepNumber extends number = number,
> extends ProcessStep<CurrentProcess, _StepNumber> {
	public override async build(instance: Duplo): Promise<BuildedPreflightStep> {
		const processFunction: ProcessBuildedFunction = await this.parent.build();

		return new BuildedPreflightStep(
			instance,
			this,
			processFunction,
		);
	}
}

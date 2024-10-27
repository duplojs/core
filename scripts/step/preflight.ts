import type { PresetGenericProcess } from "@scripts/duplose/process";
import { BuildedPreflightStep } from "./builded/preflight";
import { ProcessStep } from "./process";
import { type Duplo } from "@scripts/duplo";

export class PreflightStep<
	GenericProcess extends PresetGenericProcess = PresetGenericProcess,
	_GenericStepNumber extends number = number,
> extends ProcessStep<GenericProcess, _GenericStepNumber> {
	public override async build(instance: Duplo): Promise<BuildedPreflightStep> {
		const processFunction = await this.parent.build();

		return new BuildedPreflightStep(
			instance,
			this,
			processFunction,
		);
	}
}

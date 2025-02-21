import type { Process } from "@scripts/duplose/process";
import { BuildedPreflightStep } from "./builded/preflight";
import { type Duplo } from "@scripts/duplo";
import { createInterpolation } from "@duplojs/utils";
import { Step } from ".";
import { type ProcessStepParams } from "./process";
import { type Description } from "@scripts/description";

export class PreflightStep<
	GenericProcess extends Process = Process,
	_GenericStepNumber extends number = number,
> extends Step<GenericProcess, _GenericStepNumber> {
	public params: ProcessStepParams;

	public constructor(
		process: GenericProcess,
		params: ProcessStepParams = {},
		descriptions: Description[] = [],
	) {
		super(process, descriptions);
		this.params = params;
	}

	public async build(instance: Duplo): Promise<BuildedPreflightStep> {
		const processFunction = await this.parent.build();

		return new BuildedPreflightStep(
			instance,
			this,
			processFunction,
		);
	}

	public static insertBlockName = {
		before: createInterpolation("beforePreflightStep(index: {index})"),
		beforeTreatResult: createInterpolation("beforeTreatResultPreflightStep(index: {index})"),
		beforeIndexingResult: createInterpolation("beforeIndexingResultPreflightStep(index: {index})"),
		after: createInterpolation("afterPreflightStep(index: {index})"),
	};
}

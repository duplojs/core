import { PreflightStep } from "../preflight";
import { ProcessStep } from "../process";
import { BuildedProcessStep } from "./process";

export class BuildedPreflightStep extends BuildedProcessStep {
	public override toString(index: number): string {
		return super
			.toString(index)
			.replaceAll(`this.steps[${index}]`, `this.preflightSteps[${index}]`)
			.replace(
				ProcessStep.insertBlockName.before({ index: index.toString() }),
				PreflightStep.insertBlockName.before({ index: index.toString() }),
			)
			.replace(
				ProcessStep.insertBlockName.beforeTreatResult({ index: index.toString() }),
				PreflightStep.insertBlockName.beforeTreatResult({ index: index.toString() }),
			)
			.replace(
				ProcessStep.insertBlockName.beforeIndexingResult({ index: index.toString() }),
				PreflightStep.insertBlockName.beforeIndexingResult({ index: index.toString() }),
			)
			.replace(
				ProcessStep.insertBlockName.after({ index: index.toString() }),
				PreflightStep.insertBlockName.after({ index: index.toString() }),
			);
	}
}

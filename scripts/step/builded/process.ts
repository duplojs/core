import { BuildedStep } from ".";
import { type ProcessStepParams, ProcessStep } from "../process";
import { checkResult, condition, insertBlock, mapped, maybeAwait, skipStep, spread, StringBuilder } from "@utils/stringBuilder";
import type { ProcessBuildedFunction } from "@scripts/duplose/process";
import { type Duplo } from "@scripts/duplo";
import { simpleClone } from "@duplojs/utils";

export class BuildedProcessStep extends BuildedStep<ProcessStep> {
	public params: ProcessStepParams;

	public constructor(
		instance: Duplo,
		step: ProcessStep,
		public processFunction: ProcessBuildedFunction<any>,
	) {
		super(instance, step);
		this.params = simpleClone(step.params);

		if (typeof this.params.options === "function") {
			const originalOptions = this.params.options;
			this.params.options = (pickup) => ({
				...step.parent.definiton.options,
				...originalOptions(pickup),
			});
		} else if (this.params.options) {
			this.params.options = {
				...step.parent.definiton.options,
				...this.params.options,
			};
		} else {
			this.params.options = step.parent.definiton.options;
		}

		if (!this.params.input) {
			this.params.input = step.parent.definiton.input
				? () => step.parent.definiton.input
				: undefined;
		}
	}

	public toString(index: number): string {
		const async = this.processFunction.constructor.name === "AsyncFunction";

		const options = typeof this.params.options === "function"
			? /* js */`this.steps[${index}].params.options(${StringBuilder.floor}.pickup)`
			: /* js */`this.steps[${index}].params.options`;

		const input = condition(
			!!this.params.input,
			() => /* js */`this.steps[${index}].params.input(${StringBuilder.floor}.pickup)`,
		);

		const drop = mapped(
			this.params.pickup ?? [],
			(key) => /* js */`${StringBuilder.floor}.drop("${key}", ${StringBuilder.result}["${key}"]);`,
		);

		const insertBlockNameBefore
			= ProcessStep.insertBlockName.before({ index: index.toString() });
		const insertBlockNameBeforeTreatResult
			= ProcessStep.insertBlockName.beforeTreatResult({ index: index.toString() });
		const insertBlockNameBeforeIndexingResult
			= ProcessStep.insertBlockName.beforeIndexingResult({ index: index.toString() });
		const insertBlockNameAfter
			= ProcessStep.insertBlockName.after({ index: index.toString() });

		return spread(
			insertBlock(insertBlockNameBefore),
			skipStep(
				!!this.params.skip,
				index,
				/* js */`
				${StringBuilder.result} = ${maybeAwait(async)}this.steps[${index}].processFunction(
					${StringBuilder.request},
					${options},
					${input}
				);

				${insertBlock(insertBlockNameBeforeTreatResult)}

				${checkResult()}

				${insertBlock(insertBlockNameBeforeIndexingResult)}

				${drop}
				`,
			),
			insertBlock(insertBlockNameAfter),
		);
	}
}

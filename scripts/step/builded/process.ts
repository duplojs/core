import { simpleClone } from "@utils/simpleClone";
import { BuildedStep } from ".";
import type { ProcessStepParams, ProcessStep } from "../process";
import { checkResult, condition, insertBlock, mapped, maybeAwait, skipStep, StringBuilder } from "@utils/stringBuilder";
import type { ProcessBuildedFunction } from "@scripts/duplose/process";

export class BuildedProcessStep extends BuildedStep<ProcessStep> {
	public processFunction: ProcessBuildedFunction;

	public params: ProcessStepParams;

	public constructor(step: ProcessStep) {
		super(step);
		this.params = simpleClone(step.params);

		if (typeof this.params.options === "function") {
			const originalOptions = this.params.options;
			this.params.options = (pickup) => ({
				...step.parent.options,
				...originalOptions(pickup),
			});
		} else if (this.params.options) {
			this.params.options = {
				...step.parent.options,
				...this.params.options,
			};
		}

		if (!this.params.input) {
			this.params.input = step.parent.input
				? () => step.parent.input
				: undefined;
		}

		this.processFunction = step.parent.build();
	}

	public toString(index: number): string {
		const async = this.processFunction.constructor.name === "AsyncFunction";

		const options = typeof this.params.options === "function"
			? /* js */`this.steps[${index}].params.options(${StringBuilder.floor}.pickup)`
			: /* js */`this.steps[${index}].params.options`;

		const input = condition(
			!!this.params.input,
			() => /* js */`this.steps[${index}].input(floor.pickup)`,
		);

		const drop = mapped(
			this.params.pickup ?? [],
			(key) => /* js */`${StringBuilder.floor}.drop("${key}", ${StringBuilder.result}["${key}"]);`,
		);

		return skipStep(
			!!this.params.skip,
			index,
			/* js */`
			${insertBlock(`step-process-(${index})-before`)}

			${StringBuilder.result} = ${maybeAwait(async)}this.steps[${index}].processFunction(
				${StringBuilder.request},
				${options},
				${input}
			);

			${insertBlock(`step-process-(${index})-before-check-result`)}

			${checkResult()}

			${insertBlock(`step-process-(${index})-before-drop`)}

			${drop}

			${insertBlock(`step-process-(${index})-after`)}
			`,
		);
	}
}
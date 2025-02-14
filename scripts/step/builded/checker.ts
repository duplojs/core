import { condition, insertBlock, maybeAwait, skipStep, StringBuilder } from "@utils/stringBuilder";
import { BuildedStepWithResponses } from ".";
import type { CheckerStep, CheckerStepParams } from "../checker";
import type { CheckerHandler } from "@scripts/checker";
import { type Duplo } from "@scripts/duplo";
import { simpleClone } from "@duplojs/utils";

export class BuildedCheckerStep extends BuildedStepWithResponses<CheckerStep> {
	public checkerFunction: CheckerHandler;

	public params: CheckerStepParams;

	public constructor(
		instance: Duplo,
		step: CheckerStep,
	) {
		super(instance, step);
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

		this.checkerFunction = step.parent.handler ?? (() => ({
			info: "<([{|none|}])>",
			data: undefined,
		}));
	}

	public toString(index: number) {
		const async = this.checkerFunction.constructor.name === "AsyncFunction";

		const options = typeof this.params.options === "function"
			? /* js */`this.steps[${index}].params.options(${StringBuilder.floor}.pickup)`
			: /* js */`this.steps[${index}].params.options`;

		const checkResult = this.params.result instanceof Array
			? /* js */`!this.steps[${index}].params.result.includes(${StringBuilder.result}.info)`
			: /* js */`this.steps[${index}].params.result !== ${StringBuilder.result}.info`;

		const indexing = condition(
			!!this.params.indexing,
			() => /* js */`${StringBuilder.floor}.drop(this.steps[${index}].params.indexing, ${StringBuilder.result}.data)`,
		);

		return skipStep(
			!!this.params.skip,
			index,
			/* js */`
			${insertBlock(`step-checker-(${index})-before`)}

			${StringBuilder.result} = ${maybeAwait(async)}this.steps[${index}].checkerFunction(
				this.steps[${index}].params.input(${StringBuilder.floor}.pickup),
				(info, data) => ({info, data}),
				${options},
			);

			${insertBlock(`step-checker-(${index})-before-treat-result`)}

			if(${checkResult}){
				${StringBuilder.result} = this.steps[${index}].params.catch(
					${StringBuilder.result}.info, 
					${StringBuilder.result}.data, 
					${StringBuilder.floor}.pickup
				);

				${this.getBlockContractResponse(index)}

				break ${StringBuilder.label};
			}

			${insertBlock(`step-checker-(${index})-before-indexing`)}

			${indexing}

			${insertBlock(`step-checker-(${index})-after`)}
			`,
		);
	}
}

import { BuildedStepWithResponses } from ".";
import { checkResult, insertBlock, maybeAwait, StringBuilder } from "@utils/stringBuilder";
import type { Handler, HandlerStep } from "../handler";
import { type Duplo } from "@scripts/duplo";

export class BuildedHandlerStep extends BuildedStepWithResponses<HandlerStep> {
	public handlerFunction: Handler;

	public constructor(
		instance: Duplo,
		step: HandlerStep,
	) {
		super(instance, step);

		this.handlerFunction = step.parent;
	}

	public toString(index: number): string {
		const async = this.handlerFunction.constructor.name === "AsyncFunction";

		return /* js */`
		${insertBlock(`step-handler-(${index})-before`)}

		${StringBuilder.result} = ${maybeAwait(async)}this.steps[${index}].handlerFunction(${StringBuilder.floor}.pickup, request);

		${insertBlock(`step-handler-(${index})-before-check-result`)}

		${checkResult(this.getBlockContractResponse(index))}

		${insertBlock(`step-handler-(${index})-after`)}
		`;
	}
}

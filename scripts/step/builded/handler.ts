import { BuildedStep } from ".";
import { checkResult, insertBlock, maybeAwait, StringBuilder } from "@utils/stringBuilder";
import type { Handler, HandlerStep } from "../handler";

export class BuildedHandlerStep extends BuildedStep<HandlerStep> {
	public handlerFunction: Handler;

	public constructor(step: HandlerStep) {
		super(step);
		this.handlerFunction = step.parent;
	}

	public toString(index: number): string {
		const async = this.handlerFunction.constructor.name === "AsyncFunction";

		return /* js */`
		${insertBlock(`step-handler-(${index})-before`)}

		${StringBuilder.result} = ${maybeAwait(async)}this.steps[${index}].handlerFunction(${StringBuilder.floor}, request);

		${insertBlock(`step-handler-(${index})-before-check-result`)}

		${checkResult()}

		${insertBlock(`step-handler-(${index})-after`)}
		`;
	}
}

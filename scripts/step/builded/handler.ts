import { BuildedStepWithResponses } from ".";
import { checkResult, insertBlock, maybeAwait, StringBuilder } from "@utils/stringBuilder";
import { type Handler, HandlerStep } from "../handler";
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

		const insertBlockNameBefore
			= HandlerStep.insertBlockName.before({ index: index.toString() });
		const insertBlockNameBeforeTreatResult
			= HandlerStep.insertBlockName.beforeTreatResult({ index: index.toString() });
		const insertBlockNameAfter
			= HandlerStep.insertBlockName.after({ index: index.toString() });

		return /* js */`
		${insertBlock(insertBlockNameBefore)}

		${StringBuilder.result} = ${maybeAwait(async)}this.steps[${index}].handlerFunction(${StringBuilder.floor}.pickup, request);

		${insertBlock(insertBlockNameBeforeTreatResult)}

		${checkResult(this.getBlockContractResponse(index))}

		${insertBlock(insertBlockNameAfter)}
		`;
	}
}

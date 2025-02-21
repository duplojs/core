import { BuildedStepWithResponses } from ".";
import { type Cut, CutStep } from "../cut";
import { checkResult, insertBlock, mapped, maybeAwait, StringBuilder } from "@utils/stringBuilder";
import { type Duplo } from "@scripts/duplo";
import { simpleClone } from "@duplojs/utils";
export class BuildedCutStep extends BuildedStepWithResponses<CutStep> {
	public cutFunction: Cut;

	public drop: string[];

	public constructor(
		instance: Duplo,
		step: CutStep,
	) {
		super(instance, step);
		this.drop = simpleClone(step.drop);
		this.cutFunction = step.parent;
	}

	public toString(index: number): string {
		const async = this.cutFunction.constructor.name === "AsyncFunction";

		const drop = mapped(
			this.drop,
			(key) => /* js */`${StringBuilder.floor}.drop("${key}", ${StringBuilder.result}["${key}"]);`,
		);

		const insertBlockNameBefore
			= CutStep.insertBlockName.before({ index: index.toString() });
		const insertBlockNameBeforeTreatResult
			= CutStep.insertBlockName.beforeTreatResult({ index: index.toString() });
		const insertBlockNameBeforeIndexingResult
			= CutStep.insertBlockName.beforeIndexingResult({ index: index.toString() });
		const insertBlockNameAfter
			= CutStep.insertBlockName.after({ index: index.toString() });

		return /* js */`
		${insertBlock(insertBlockNameBefore)}

		${StringBuilder.result} = ${maybeAwait(async)}this.steps[${index}].cutFunction(${StringBuilder.floor}, request);

		${insertBlock(insertBlockNameBeforeTreatResult)}

		${checkResult(this.getBlockContractResponse(index))}

		${insertBlock(insertBlockNameBeforeIndexingResult)}

		${drop}

		${insertBlock(insertBlockNameAfter)}
		`;
	}
}

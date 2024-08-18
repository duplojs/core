import { simpleClone } from "@utils/simpleClone";
import { BuildedStep } from ".";
import type { CutStep, Cut } from "../cut";
import { checkResult, insertBlock, mapped, maybeAwait, StringBuilder } from "@utils/stringBuilder";

export class BuildedCutStep extends BuildedStep<CutStep> {
	public cutFunction: Cut;

	public drop: string[];

	public constructor(step: CutStep) {
		super(step);
		this.drop = simpleClone(step.drop);
		this.cutFunction = step.parent;
	}

	public toString(index: number): string {
		const async = this.cutFunction.constructor.name === "AsyncFunction";

		const drop = mapped(
			this.drop,
			(key) => /* js */`${StringBuilder.floor}.drop("${key}", ${StringBuilder.result}["${key}"]);`,
		);

		return /* js */`
		${insertBlock(`step-cut-(${index})-before`)}

		${StringBuilder.result} = ${maybeAwait(async)}this.steps[${index}].cutFunction(${StringBuilder.floor}, request);

		${insertBlock(`step-cut-(${index})-before-check-result`)}

		${checkResult()}

		${insertBlock(`step-cut-(${index})-before-drop`)}

		${drop}

		${insertBlock(`step-cut-(${index})-after`)}
		`;
	}
}

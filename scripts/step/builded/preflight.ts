import { checkResult, condition, insertBlock, mapped, maybeAwait, StringBuilder } from "@utils/stringBuilder";
import { BuildedProcessStep } from "./process";

export class BuildedPreflightStep extends BuildedProcessStep {
	public override toString(index: number): string {
		const async = this.processFunction.constructor.name === "AsyncFunction";

		const options = typeof this.params.options === "function"
			? /* js */`this.preflightSteps[${index}].params.options(${StringBuilder.floor}.pickup)`
			: /* js */`this.preflightSteps[${index}].params.options`;

		const input = condition(
			!!this.params.input,
			() => /* js */`this.preflightSteps[${index}].input(floor.pickup)`,
		);

		const drop = mapped(
			this.params.pickup ?? [],
			(key) => /* js */`${StringBuilder.floor}.drop("${key}", ${StringBuilder.result}["${key}"]);`,
		);

		return /* js */`
			${insertBlock(`preflight-process-(${index})-before`)}

			${StringBuilder.result} = ${maybeAwait(async)}this.preflightSteps[${index}].processFunction(
				${StringBuilder.request},
				${options},
				${input}
			);

			${insertBlock(`preflight-process-(${index})-before-check-result`)}

			${checkResult()}

			${insertBlock(`preflight-process-(${index})-before-drop`)}

			${drop}

			${insertBlock(`preflight-process-(${index})-after`)}
		`;
	}
}

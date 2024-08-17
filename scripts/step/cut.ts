import type { AnyFunction } from "@utils/types";
import { Step } from ".";
import type { Description } from "@scripts/description";
import { checkResult, insertBlock, mapped, maybeAwait, StringBuilder } from "@utils/stringBuilder";

export class CutStep extends Step<AnyFunction> {
	public drop: string[];

	public constructor(
		cutFunction: AnyFunction,
		drop: string[] = [],
		descriptions: Description[] = [],
	) {
		super(cutFunction, descriptions);
		this.drop = drop;
	}

	public toString(index: number): string {
		const async = this.parent.constructor.name === "AsyncFunction";

		const drop = mapped(
			this.drop,
			(key) => /* js */`${StringBuilder.floor}.drop("${key}", ${StringBuilder.result}["${key}"]);`,
		);

		return /* js */`
		${insertBlock(`step-cut-(${index})-before`)}

		${StringBuilder.result} = ${maybeAwait(async)}this.steps[${index}].parent(${StringBuilder.floor}, request);

		${insertBlock(`step-cut-(${index})-before-check-result`)}

		${checkResult()}

		${insertBlock(`step-cut-(${index})-before-drop`)}

		${drop}

		${insertBlock(`step-cut-(${index})-after`)}
		`;
	}
}

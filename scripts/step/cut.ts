import type { AnyFunction } from "@utils/types";
import { Step } from ".";
import type { Description } from "@scripts/description";
import { insertBlock } from "@utils/insertBlock";

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

	public toString(): string {
		const async = this.parent.constructor.name === "AsyncFunction"
			? "await "
			: "";
		return /* js */`
		${insertBlock("step-cut-({index})-before-function")}

		result = ${async}this.steps[{index}].parent(floor, request);

		${insertBlock("step-cut-({index})-before-drop")}

		${this.drop.map((key) => `floor.drop("${key}", result["${key}"]);`).join("\n")}

		${insertBlock("step-cut-({index})-after")}
		`;
	}
}

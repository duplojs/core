import { simpleClone } from "@utils/simpleClone";
import { BuildedStep } from ".";
import type { CutStep, Cut } from "../cut";
import { checkResult, condition, insertBlock, mapped, maybeAwait, StringBuilder } from "@utils/stringBuilder";
import type { ZodType, ZodUnion } from "zod";
import { zod } from "@scripts/index";
import { type Duplo } from "@scripts/duplo";

export class BuildedCutStep extends BuildedStep<CutStep> {
	public cutFunction: Cut;

	public drop: string[];

	public responseZodSchema?: ZodUnion<any>;

	public constructor(
		instance: Duplo,
		step: CutStep,
	) {
		super(instance, step);
		this.drop = simpleClone(step.drop);
		this.cutFunction = step.parent;

		if (step.responses.length !== 0) {
			this.responseZodSchema = zod.union(
				step.responses.map(
					(contractResponse) => zod.object({
						code: zod.literal(contractResponse.code),
						info: zod.literal(contractResponse.information),
						body: contractResponse.body,
					}) satisfies ZodType,
				) as any,
			);
		}
	}

	public toString(index: number): string {
		const async = this.cutFunction.constructor.name === "AsyncFunction";

		const drop = mapped(
			this.drop,
			(key) => /* js */`${StringBuilder.floor}.drop("${key}", ${StringBuilder.result}["${key}"]);`,
		);

		const contractResponses = condition(
			!!this.responseZodSchema && !this.instance.config.disabledRuntimeEndPointCheck,
			() => /* js */`
				let temp = this.steps[${index}].responseZodSchema.safeParse(${StringBuilder.result});

				if(!temp.success){
					throw new this.ContractResponseError(temp.error, ${StringBuilder.result});
				}
			`,
		);

		return /* js */`
		${insertBlock(`step-cut-(${index})-before`)}

		${StringBuilder.result} = ${maybeAwait(async)}this.steps[${index}].cutFunction(${StringBuilder.floor}, request);

		${insertBlock(`step-cut-(${index})-before-check-result`)}

		${checkResult(contractResponses)}

		${insertBlock(`step-cut-(${index})-before-drop`)}

		${drop}

		${insertBlock(`step-cut-(${index})-after`)}
		`;
	}
}

import { BuildedStep } from ".";
import { checkResult, condition, insertBlock, maybeAwait, StringBuilder } from "@utils/stringBuilder";
import type { Handler, HandlerStep } from "../handler";
import type { ZodType, ZodUnion } from "zod";
import { zod } from "@scripts/index";

export class BuildedHandlerStep extends BuildedStep<HandlerStep> {
	public handlerFunction: Handler;

	public responseZodSchema?: ZodUnion<any>;

	public constructor(step: HandlerStep) {
		super(step);

		this.handlerFunction = step.parent;

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
		const async = this.handlerFunction.constructor.name === "AsyncFunction";

		const contractResponses = condition(
			!!this.responseZodSchema,
			() => /* js */`
				let temp = this.steps[${index}].responseZodSchema.safeParse(${StringBuilder.result});

				if(!temp.success){
					throw new this.ContractResponseError(temp.error, ${StringBuilder.result});
				}
			`,
		);

		return /* js */`
		${insertBlock(`step-handler-(${index})-before`)}

		${StringBuilder.result} = ${maybeAwait(async)}this.steps[${index}].handlerFunction(${StringBuilder.floor}, request);

		${insertBlock(`step-handler-(${index})-before-check-result`)}

		${checkResult(contractResponses)}

		${insertBlock(`step-handler-(${index})-after`)}
		`;
	}
}

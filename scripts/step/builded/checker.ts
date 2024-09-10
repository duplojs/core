import { condition, insertBlock, maybeAwait, skipStep, StringBuilder } from "@utils/stringBuilder";
import { BuildedStep } from ".";
import type { CheckerStep, CheckerStepParams } from "../checker";
import { simpleClone } from "@utils/simpleClone";
import type { CheckerHandler } from "@scripts/checker";
import type { ZodType, ZodUnion } from "zod";
import { zod } from "@scripts/zod";
import { type Duplo } from "@scripts/duplo";

export class BuildedCheckerStep extends BuildedStep<CheckerStep> {
	public checkerFunction: CheckerHandler;

	public params: CheckerStepParams;

	public responseZodSchema?: ZodUnion<any>;

	public constructor(
		instance: Duplo,
		step: CheckerStep,
	) {
		super(instance, step);
		this.params = simpleClone(step.params);

		if (typeof this.params.options === "function") {
			const originalOptions = this.params.options;
			this.params.options = (pickup) => ({
				...step.parent.options,
				...originalOptions(pickup),
			});
		} else if (this.params.options) {
			this.params.options = {
				...step.parent.options,
				...this.params.options,
			};
		}

		this.checkerFunction = step.parent.handler ?? (() => ({
			info: "<([{|none|}])>",
			data: undefined,
		}));

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

	public toString(index: number) {
		const async = this.checkerFunction.constructor.name === "AsyncFunction";

		const options = typeof this.params.options === "function"
			? /* js */`this.steps[${index}].params.options(${StringBuilder.floor}.pickup)`
			: /* js */`this.steps[${index}].params.options`;

		const checkResult = this.params.result instanceof Array
			? /* js */`!this.steps[${index}].params.result.includes(${StringBuilder.result}.info)`
			: /* js */`this.steps[${index}].params.result !== ${StringBuilder.result}.info`;

		const indexing = condition(
			!!this.params.indexing,
			() => /* js */`${StringBuilder.floor}.drop(this.steps[${index}].params.indexing, ${StringBuilder.result}.data)`,
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

		return skipStep(
			!!this.params.skip,
			index,
			/* js */`
			${insertBlock(`step-checker-(${index})-before`)}

			${StringBuilder.result} = ${maybeAwait(async)}this.steps[${index}].checkerFunction(
				this.steps[${index}].params.input(${StringBuilder.floor}.pickup),
				(info, data) => ({info, data}),
				${options},
			);

			${insertBlock(`step-checker-(${index})-before-treat-result`)}

			if(${checkResult}){
				${StringBuilder.result} = this.steps[${index}].params.catch(
					${StringBuilder.result}.info, 
					${StringBuilder.result}.data, 
					${StringBuilder.floor}.pickup
				);

				${contractResponses}

				break ${StringBuilder.label};
			}

			${insertBlock(`step-checker-(${index})-before-indexing`)}

			${indexing}

			${insertBlock(`step-checker-(${index})-after`)}
			`,
		);
	}
}

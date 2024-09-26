import type { Duplo } from "@scripts/duplo";
import type { Step, StepWithResponse } from "..";
import { zod, type ZodSpace } from "@scripts/parser";
import ZodAccelerator, { type ZodAcceleratorParser } from "@duplojs/zod-accelerator";
import { condition, StringBuilder } from "@utils/stringBuilder";
import { findZodTypeInZodSchema } from "@utils/findZodTypeInZodSchema";
import { ContractResponseHasZodEffectError } from "@scripts/error/contractResponseHasZodEffectError";

export abstract class BuildedStep<T extends Step = Step> {
	public constructor(
		public instance: Duplo,
		public step: T,
	) {}

	public abstract toString(index: number): string;
}

export abstract class BuildedStepWithResponses<
	T extends StepWithResponse = StepWithResponse,
> extends BuildedStep<T> {
	public responseZodSchema?: ZodSpace.ZodUnion<any> | ZodAcceleratorParser<ZodSpace.ZodUnion<any>>;

	public constructor(
		instance: Duplo,
		step: T,
	) {
		super(instance, step);

		if (step.responses.length !== 0) {
			this.responseZodSchema = zod.union(
				step.responses.map(
					(contractResponse) => zod.object({
						code: zod.literal(contractResponse.code),
						information: contractResponse.information
							? zod.literal(contractResponse.information)
							: zod.string().optional(),
						body: contractResponse.body,
					}) satisfies ZodSpace.ZodType,
				) as any,
			);

			if (findZodTypeInZodSchema([zod.ZodEffects], this.responseZodSchema).length > 0) {
				throw new ContractResponseHasZodEffectError();
			}

			if (!instance.config.disabledZodAccelerator) {
				this.responseZodSchema = ZodAccelerator.build(this.responseZodSchema);
			}
		}
	}

	public getBlockContractResponse(index: number) {
		return condition(
			!!this.responseZodSchema && !this.instance.config.disabledRuntimeEndPointCheck,
			() => /* js */`
				let temp = this.steps[${index}].responseZodSchema.safeParse(${StringBuilder.result});

				if(!temp.success){
					throw new this.ContractResponseError(temp.error, ${StringBuilder.result});
				}

				${StringBuilder.result}.code = temp.data.code;
				${StringBuilder.result}.information = temp.data.information;
				${StringBuilder.result}.body = temp.data.body;
			`,
		);
	}
}

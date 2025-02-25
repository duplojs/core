import type { Duplo } from "@scripts/duplo";
import type { Step, StepWithResponse } from "..";
import { zod, type ZodSpace } from "@scripts/parser";
import ZodAccelerator, { type ZodAcceleratorParser } from "@duplojs/zod-accelerator";
import { condition, StringBuilder } from "@utils/stringBuilder";
import { findZodTypeInZodSchema } from "@utils/findZodTypeInZodSchema";
import { ContractResponseHasZodEffectError } from "@scripts/error/contractResponseHasZodEffectError";
import { ForceEnabledRuntimeEndPointCheck } from "@scripts/description/runtimeEndPointCheck/forceEnabled";
import { ForceDisabledRuntimeEndPointCheck } from "@scripts/description/runtimeEndPointCheck/forceDisabled";
import { ForceDisabledZodAccelerator } from "@scripts/description/zodAccelerator/forceDisabled";
import { ForceEnabledZodAccelerator } from "@scripts/description/zodAccelerator/forceEnabled";

export abstract class BuildedStep<T extends Step = Step> {
	public constructor(
		public instance: Duplo,
		public step: T,
	) {}

	public zodAcceleratorIsEnabled() {
		const zodAcceleratorIsEnabled = !this.instance.config.disabledZodAccelerator
			|| !!this.step.descriptions.find(
				(desc) => desc instanceof ForceEnabledZodAccelerator && !desc.isExpire,
			);

		const forceDisabledZodAccelerator = !!this.step.descriptions.find(
			(desc) => desc instanceof ForceDisabledZodAccelerator && !desc.isExpire,
		);

		return zodAcceleratorIsEnabled && !forceDisabledZodAccelerator;
	}

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

		if (step.responses.length !== 0 && this.runtimeEndPointCheckIsEnabled()) {
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

			if (this.zodAcceleratorIsEnabled()) {
				this.responseZodSchema = ZodAccelerator.build(this.responseZodSchema);
			}
		}
	}

	public runtimeEndPointCheckIsEnabled() {
		const runtimeEndPointCheckIsEnabled = !this.instance.config.disabledRuntimeEndPointCheck
				|| !!this.step.descriptions.find(
					(desc) => desc instanceof ForceEnabledRuntimeEndPointCheck && !desc.isExpire,
				);

		const forceDisabledRuntimeEndPointCheck = !!this.step.descriptions.find(
			(desc) => desc instanceof ForceDisabledRuntimeEndPointCheck && !desc.isExpire,
		);

		return runtimeEndPointCheckIsEnabled && !forceDisabledRuntimeEndPointCheck;
	}

	public getBlockContractResponse(index: number) {
		return condition(
			!!this.responseZodSchema,
			() => /* js */`
				let temp = this.steps[${index}].responseZodSchema.safeParse(${StringBuilder.result});

				if(!temp.success){
					throw new this.ContractResponseError(temp.error, ${StringBuilder.result});
				}
			`,
		);
	}
}

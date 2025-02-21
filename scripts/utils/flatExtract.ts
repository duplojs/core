import type { ZodSpace } from "@scripts/parser";
import type { ExtractObject } from "@scripts/step/extract";
import { type ObjectKey, type SimplifyType } from "@duplojs/utils";

export interface KeyAndValue<
	GenericObjectKey extends ObjectKey = ObjectKey,
	GenericValue extends unknown = unknown,
> {
	key: GenericObjectKey;
	value: GenericValue;
}

export type FlatExtract<
	GenericExtractObject extends ExtractObject,
	GenericKeyAndValue extends KeyAndValue = {
		[Prop in keyof GenericExtractObject]:
		GenericExtractObject[Prop] extends ZodSpace.ZodType
			? KeyAndValue<Prop, ZodSpace.infer<GenericExtractObject[Prop]>>
			: {
				[SubProp in keyof GenericExtractObject[Prop]]:
				GenericExtractObject[Prop][SubProp] extends ZodSpace.ZodType
					? KeyAndValue<SubProp, ZodSpace.infer<GenericExtractObject[Prop][SubProp]>>
					: never
			}[keyof GenericExtractObject[Prop]]
	}[keyof GenericExtractObject],
> = SimplifyType<{
	[KeyAndValue in GenericKeyAndValue as KeyAndValue["key"]]: KeyAndValue["value"];
}>;

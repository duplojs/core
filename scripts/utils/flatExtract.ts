import type { ExtractObject } from "@scripts/duplose";
import type { ZodSpace, ZodPresetChecker } from "@scripts/parser";
import type { ObjectKey } from "./types";
import type { GetPresetCheckerGeneric } from "@scripts/builder/checker";
import type { SimplifyType } from "./simplifyType";

export interface KeyAndValue<
	GenericObjectKey extends ObjectKey = ObjectKey,
	GenericValue extends unknown = unknown,
> {
	key: GenericObjectKey;
	value: GenericValue;
}

export type ZodTypeToKeyAndValue<
	GenericObjectKey extends ObjectKey,
	GenericZodType extends ZodSpace.ZodType,
> = GenericZodType extends ZodPresetChecker<any, infer inferedPresetChecker>
	? (
		string extends GetPresetCheckerGeneric<inferedPresetChecker>["key"]
			? never
			: KeyAndValue<
				GetPresetCheckerGeneric<inferedPresetChecker>["key"],
				ZodSpace.infer<GenericZodType>
			>
	)
	: KeyAndValue<GenericObjectKey, ZodSpace.infer<GenericZodType>>;

export type FlatExtract<
	T extends ExtractObject,
	O extends KeyAndValue = {
		[P in keyof T]: T[P] extends ZodSpace.ZodType
			? ZodTypeToKeyAndValue<P, T[P]>
			: {
				[S in keyof T[P]]: T[P][S] extends ZodSpace.ZodType
					? ZodTypeToKeyAndValue<S, T[P][S]>
					: never
			}[keyof T[P]]
	}[keyof T],
> = SimplifyType<{
	[P in O as P["key"]]: P["value"];
}>;

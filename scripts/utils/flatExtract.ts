import type { ExtractObject } from "@scripts/duplose";
import type { infer as zodInfer, ZodType } from "zod";
import type { ObjectKey } from "./types";

export interface KeyToType<
	K extends ObjectKey = ObjectKey,
	V extends unknown = unknown,
> {
	key: K;
	value: V;
}

export type FlatExtract<
	T extends ExtractObject,
	O extends KeyToType = {
		[P in keyof T]: T[P] extends ZodType
			? KeyToType<P, zodInfer<T[P]>>
			: {
				[S in keyof T[P]]: T[P][S] extends ZodType
					? KeyToType<S, zodInfer<T[P][S]>>
					: never
			}[keyof T[P]]
	}[keyof T],
> = {
	[P in O as P["key"]]: P["value"];
};

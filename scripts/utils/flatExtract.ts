import type { ExtractObject } from "@scripts/duplose";
import type { zodSpace } from "@scripts/zod";
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
		[P in keyof T]: T[P] extends zodSpace.ZodType
			? KeyToType<P, zodSpace.infer<T[P]>>
			: {
				[S in keyof T[P]]: T[P][S] extends zodSpace.ZodType
					? KeyToType<S, zodSpace.infer<T[P][S]>>
					: never
			}[keyof T[P]]
	}[keyof T],
> = {
	[P in O as P["key"]]: P["value"];
};

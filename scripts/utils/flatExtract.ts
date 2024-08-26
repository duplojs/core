import type { ExtractObject } from "@scripts/duplose";
import type { infer as zodInfer, ZodType } from "zod";

interface FlatPath {
	path: string;
	type: unknown;
}

type ToPaths<T extends ExtractObject> = {
	[K in keyof T]: T[K] extends ZodType
		? {
			path: K;
			type: zodInfer<T[K]>;
		}
		: {
			[P in keyof T[K]]: T[K][P] extends ZodType
				? {
					path: P;
					type: zodInfer<T[K][P]>;
				}
				: never
		}[keyof T[K]];
}[keyof T];

type FromPaths<T extends FlatPath> = {
	[P in T as P["path"]]: P["type"];
};

export type FlatExtract<
	T extends ExtractObject,
	flatPath = ToPaths<T>,
> = FromPaths<flatPath extends FlatPath ? flatPath : never>;

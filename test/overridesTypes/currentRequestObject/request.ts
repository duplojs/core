import type { CurrentRequestObject } from "@scripts/request";
import type { ExpectType } from "@test/utils/expectType";

declare module "@scripts/request" {
	interface RequestObject {
		override: string;
	}
}

type check = ExpectType<string, CurrentRequestObject, "strict">;

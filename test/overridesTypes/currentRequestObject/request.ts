import { type ExpectType } from "@duplojs/utils";
import type { CurrentRequestObject } from "@scripts/request";

declare module "@scripts/request" {
	interface RequestObject {
		override: string;
	}
}

type check = ExpectType<string, CurrentRequestObject, "strict">;

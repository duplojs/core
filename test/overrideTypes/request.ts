import type { CurrentRequestObject, HttpMethod } from "@scripts/request";
import type { ExpectType } from "@test/utils/expectType";

declare module "@scripts/request" {
	interface RequestObject {
		override: string;
	}

	interface HttpMethods {
		TRACE: true;
	}
}

type CheckOverrideRequestObject = ExpectType<string, CurrentRequestObject, "strict">;

type CheckNewHttpMethod = ExpectType<
	HttpMethod,
	"GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "TRACE",
	"strict"
>;

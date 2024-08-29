import type { HttpMethod } from "@scripts/request";
import type { ExpectType } from "@test/utils/expectType";

declare module "@scripts/request" {
	interface HttpMethods {
		TRACE: true;
	}
}

type Check = ExpectType<
	HttpMethod,
	"GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "TRACE",
	"strict"
>;

import type { HttpMethod } from "@scripts/duplose/route";
import type { ExpectType } from "@test/utils/expectType";

declare module "@scripts/duplose/route" {
	interface HttpMethods {
		TRACE: true;
	}
}

type Check = ExpectType<
	HttpMethod,
	"GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "TRACE",
	"strict"
>;

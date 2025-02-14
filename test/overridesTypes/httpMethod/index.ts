import { type ExpectType } from "@duplojs/utils";
import type { HttpMethod } from "@scripts/duplose/route";

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

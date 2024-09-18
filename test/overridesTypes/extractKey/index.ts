import type { ExtractKey } from "@scripts/duplose";
import type { ExpectType } from "@test/utils/expectType";

declare module "@scripts/duplose" {
	interface DisabledExtractKey {
		path: true;
		host: true;
	}
}

type check = ExpectType<
	ExtractKey,
	"headers" | "url" | "origin" | "params" | "query" | "matchedPath" | "body",
	"strict"
>;

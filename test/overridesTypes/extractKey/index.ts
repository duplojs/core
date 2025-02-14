import { type ExpectType } from "@duplojs/utils";
import type { ExtractKey } from "@scripts/step/extract";

declare module "@scripts/step/extract" {
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

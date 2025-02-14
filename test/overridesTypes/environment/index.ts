import { type ExpectType } from "@duplojs/utils";
import type { Environment } from "@scripts/duplo";

declare module "@scripts/duplo" {
	interface Environments {
		PREPROD: true;
	}
}

type Check = ExpectType<
	Environment,
	"DEV" | "PROD" | "TEST" | "PREPROD",
	"strict"
>;

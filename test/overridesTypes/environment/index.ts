import type { Environment } from "@scripts/duplo";
import type { ExpectType } from "@test/utils/expectType";

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

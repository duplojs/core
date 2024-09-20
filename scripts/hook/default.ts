import type { CurrentRequestObject } from "@scripts/request";

export function hookRouteError(request: CurrentRequestObject, error: unknown) {
	throw error;
}

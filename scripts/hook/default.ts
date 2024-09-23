import { ContractResponseError } from "@scripts/error/contractResponseError";
import type { CurrentRequestObject } from "@scripts/request";
import { InternalServerErrorHttpResponse, LoopDetectedHttpResponse, ServiceUnavailableHttpResponse } from "@scripts/response/simplePreset";

export function hookRouteError(request: CurrentRequestObject, error: unknown) {
	return new InternalServerErrorHttpResponse("SERVER_ERROR", error);
}

export function hookRouteContractResponseError(request: CurrentRequestObject, error: unknown) {
	if (error instanceof ContractResponseError) {
		return new ServiceUnavailableHttpResponse("WRONG_RESPONSE_CONTRACT", error);
	}
}

export function hookRouteRangeError(request: CurrentRequestObject, error: unknown) {
	if (error instanceof RangeError) {
		return new LoopDetectedHttpResponse("RANGE_ERROR", error);
	}
}

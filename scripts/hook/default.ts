import { GlobalPrefixDescription } from "@scripts/description/prefix/global";
import { type Duplo } from "@scripts/duplo";
import { type Duplose } from "@scripts/duplose";
import { Route } from "@scripts/duplose/route";
import { ContractResponseError } from "@scripts/error/contractResponseError";
import type { CurrentRequestObject } from "@scripts/request";
import type { PresetGenericResponse } from "@scripts/response";
import { InternalServerErrorHttpResponse, LoopDetectedHttpResponse, ServiceUnavailableHttpResponse } from "@scripts/response/simplePreset";
import { instanceofDuplose } from "@utils/instanceofDuplose";

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

export function makeHookInformation(keyToInformationInHeaders: string) {
	return function hookInformation(request: CurrentRequestObject, response: PresetGenericResponse): undefined {
		if (response.information) {
			response.headers[keyToInformationInHeaders] = response.information;
		}
	};
}

export function makeHookAddGlobalPrefix(prefix: string[]) {
	return function hookAddGlobalPrefix(duplose: Duplose) {
		if (instanceofDuplose(Route, duplose)) {
			duplose.definiton.descriptions.push(
				new GlobalPrefixDescription(prefix),
			);
		}
	};
}

export function hookRemoveDescriptions(instance: Duplo) {
	instance.duploses.forEach(
		(duplose) => {
			duplose.definiton.descriptions = [];

			duplose.definiton.steps.forEach((step) => {
				step.descriptions = [];
			});

			if (instanceofDuplose(Route, duplose)) {
				duplose.definiton.preflightSteps.forEach((step) => {
					step.descriptions = [];
				});
			}
		},
	);
}

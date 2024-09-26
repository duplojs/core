import { InternalServerErrorHttpResponse, LoopDetectedHttpResponse, ServiceUnavailableHttpResponse } from "@scripts/response/simplePreset";
import { hookRouteError, hookRouteContractResponseError, hookRouteRangeError } from "./default";
import { ContractResponseError } from "@scripts/error/contractResponseError";

describe("default hook", () => {
	it("route error", () => {
		expect(hookRouteError({} as any, new Error()))
			.toStrictEqual(
				new InternalServerErrorHttpResponse("SERVER_ERROR", new Error()),
			);
	});

	it("contract response error", () => {
		expect(hookRouteContractResponseError({} as any, new ContractResponseError(undefined as any, undefined as any)))
			.toStrictEqual(
				new ServiceUnavailableHttpResponse("WRONG_RESPONSE_CONTRACT", new ContractResponseError(undefined as any, undefined as any)),
			);
	});

	it("range error", () => {
		expect(hookRouteRangeError({} as any, new RangeError()))
			.toStrictEqual(
				new LoopDetectedHttpResponse("RANGE_ERROR", new RangeError()),
			);
	});
});

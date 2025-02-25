import { InternalServerErrorHttpResponse, LoopDetectedHttpResponse, OkHttpResponse, ServiceUnavailableHttpResponse } from "@scripts/response/simplePreset";
import { hookRouteError, hookRouteContractResponseError, hookRouteRangeError, makeHookInformation, makeHookAddGlobalPrefix, hookRemoveDescriptions } from "./default";
import { ContractResponseError } from "@scripts/error/contractResponseError";
import { makeFakeRequest } from "@test/utils/request";
import { Route } from "@scripts/duplose/route";
import { createRouteDefinition } from "@test/utils/manualDuplose";
import { GlobalPrefixDescription } from "@scripts/description/prefix/global";
import { duploTest } from "@test/utils/duploTest";
import { fixtureCheckerStep, fixtureDescription, fixtureProcessStep } from "@test/utils/fixture";

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

	it("put information in headers response", () => {
		const hookInformation = makeHookInformation("information-test");

		const response = new OkHttpResponse("myInformation");

		hookInformation(makeFakeRequest(), response);

		expect(response.headers["information-test"]).toBe("myInformation");
	});

	it("Add Global Prefix description to route", () => {
		const prefix = ["toto", "tata"];

		const hookAddGlobalPrefix = makeHookAddGlobalPrefix(prefix);

		const route = new Route(createRouteDefinition());

		hookAddGlobalPrefix(route);

		expect(route.definiton.descriptions).toEqual([new GlobalPrefixDescription(prefix)]);
	});

	it("remove descriuption from duplose", () => {
		fixtureCheckerStep.descriptions.push(fixtureDescription);
		fixtureProcessStep.descriptions.push(fixtureDescription);

		const route = new Route(createRouteDefinition({
			steps: [fixtureCheckerStep],
			preflightSteps: [fixtureProcessStep],
			descriptions: [fixtureDescription],
		}));

		duploTest.register(route);

		hookRemoveDescriptions(duploTest);

		expect(route.definiton.descriptions).toEqual([]);
		expect(route.definiton.steps.at(0)!.descriptions).toEqual([]);
		expect(route.definiton.preflightSteps.at(0)!.descriptions).toEqual([]);
	});
});

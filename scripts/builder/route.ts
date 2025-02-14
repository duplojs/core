import type { Checker, GetCheckerGeneric } from "@scripts/checker";
import type { Description } from "@scripts/description";
import { type HttpMethod, Route, type RouteDefinition } from "@scripts/duplose/route";
import type { CurrentRequestObject } from "@scripts/request";
import type { Step } from "@scripts/step";
import type { PreflightStep } from "@scripts/step/preflight";
import type { FlatExtract } from "@utils/flatExtract";
import type { PresetChecker, GetPresetCheckerGeneric } from "./checker";
import type { ContractResponse, ContractToResponse } from "@scripts/response";
import { CheckerStep, type CheckerStepParams } from "@scripts/step/checker";
import type { DroppedValue, Floor } from "@scripts/floor";
import { ProcessStep, type ProcessStepParams } from "@scripts/step/process";
import type { GetProcessGeneric, Process } from "@scripts/duplose/process";
import { type Cut, CutStep } from "@scripts/step/cut";
import { HandlerStep, type Handler } from "@scripts/step/handler";
import { ExtractStep, type ExtractErrorFunction, type ExtractObject } from "@scripts/step/extract";
import { useBuilder } from "./duplose";
import { type AddOne, simpleClone } from "@duplojs/utils";

export interface RouteBuilder<
	GenericRequest extends CurrentRequestObject = CurrentRequestObject,
	GenericPreflightSteps extends PreflightStep = PreflightStep,
	GenericSteps extends Step = Step,
	GenericStepsCount extends number = 0,
	GenericFloorData extends object = object,
> {
	extract<
		GenericExtract extends ExtractObject<GenericRequest>,
		GenericFlatExtract extends FlatExtract<GenericExtract>,
	>(
		extract: GenericExtract,
		catchError?: ExtractErrorFunction,
		...desc: Description[]
	): RouteBuilder<
		GenericRequest,
		GenericPreflightSteps,
		GenericSteps | ExtractStep<GenericExtract, GenericStepsCount>,
		AddOne<GenericStepsCount>,
		Omit<GenericFloorData, keyof GenericFlatExtract> & NoInfer<GenericFlatExtract>
	>;

	check<
		GenericChecker extends Checker,
		GenericInfo extends string,
		GenericKey extends string,
		GenericSkip extends ((floor: Floor<GenericFloorData>["pickup"]) => boolean) | undefined,
		GenericContractResponse extends ContractResponse,
		GenericResponse extends ContractToResponse<GenericContractResponse>,
		GenericCheckerValue extends GetCheckerGeneric<GenericChecker>,
	>(
		checker: GenericChecker,
		params: CheckerStepParams<
			GenericCheckerValue,
			GenericInfo,
			GenericKey,
			GenericResponse,
			GenericFloorData,
			GenericSkip
		>,
		responses?: GenericContractResponse | GenericContractResponse[],
		...desc: Description[]
	): RouteBuilder<
		GenericRequest,
		GenericPreflightSteps,
		GenericSteps | CheckerStep<GenericChecker, GenericContractResponse, GenericStepsCount>,
		AddOne<GenericStepsCount>,
		(
			string extends GenericKey
				? object
				: {
					[P in GenericKey]:
						| Extract<GenericCheckerValue["output"], { info: GenericInfo }>["data"]
						| (undefined extends GenericSkip ? never : undefined)
				}
		) & (
			string extends GenericKey
				? GenericFloorData
				: Omit<GenericFloorData, GenericKey>
		)
	>;

	presetCheck<
		GenericPresetChecker extends PresetChecker,
		GenericPresetCheckerValue extends GetPresetCheckerGeneric<GenericPresetChecker>,
		GenericCheckerValue extends GetCheckerGeneric<GenericPresetCheckerValue["checker"]>,
	>(
		presetChecker: GenericPresetChecker,
		input: (pickup: Floor<GenericFloorData>["pickup"]) => GenericPresetCheckerValue["newInput"],
		...desc: Description[]
	): RouteBuilder<
		GenericRequest,
		GenericPreflightSteps,
		GenericSteps | CheckerStep<
			GenericPresetCheckerValue["checker"],
			GenericPresetCheckerValue["response"],
			GenericStepsCount
		>,
		AddOne<GenericStepsCount>,
		(
			string extends GenericPresetCheckerValue["key"]
				? object
				: {
					[P in GenericPresetCheckerValue["key"]]:
						| Extract<GenericCheckerValue["output"], { info: GenericPresetCheckerValue["info"] }>["data"]
				}
		) & (
			string extends GenericPresetCheckerValue["key"]
				? GenericFloorData
				: Omit<GenericFloorData, GenericPresetCheckerValue["key"]>
		)
	>;

	execute<
		GenericProcess extends Process,
		GenericPickup extends string,
		GenericSkip extends ((floor: Floor<GenericFloorData>["pickup"]) => boolean) | undefined,
		GenericProcessValue extends GetProcessGeneric<GenericProcess>,
	>(
		process: GenericProcess,
		params?: ProcessStepParams<
			GenericProcessValue,
			GenericPickup,
			GenericFloorData,
			GenericSkip
		>,
		...desc: Description[]
	): RouteBuilder<
		GenericRequest & GenericProcessValue["request"],
		GenericPreflightSteps,
		GenericSteps | ProcessStep<GenericProcess, GenericStepsCount>,
		AddOne<GenericStepsCount>,
		(
			undefined extends GenericSkip
				? Pick<
					GenericProcessValue["floor"],
					GenericPickup extends keyof GenericProcessValue["floor"] ? GenericPickup : never
				>
				: Partial<
					Pick<
						GenericProcessValue["floor"],
						GenericPickup extends keyof GenericProcessValue["floor"] ? GenericPickup : never
					>
				>
		) & (
			string extends GenericPickup
				? GenericFloorData
				: Omit<GenericFloorData, GenericPickup>
		)
	>;

	cut<
		GenericContractResponse extends ContractResponse,
		GenericResponse extends ContractToResponse<GenericContractResponse>,
		GenericReturn extends DroppedValue | GenericResponse,
		GenericDroppedValue extends Exclude<GenericReturn, GenericResponse>,
		GenericDrop extends string,
	>(
		cutFunction: Cut<
			GenericFloorData,
			GenericRequest,
			GenericReturn
		>,
		drop?: GenericDrop[] & NoInfer<keyof GenericDroppedValue>[],
		responses?: GenericContractResponse | GenericContractResponse[],
		...desc: Description[]
	): RouteBuilder<
		GenericRequest,
		GenericPreflightSteps,
		GenericSteps | CutStep<GenericContractResponse, GenericStepsCount>,
		AddOne<GenericStepsCount>,
		(
			string extends GenericDrop
				? GenericFloorData
				: Omit<GenericFloorData, GenericDrop> & Pick<GenericDroppedValue, GenericDrop>
		)
	>;

	handler<
		GenericContractResponse extends ContractResponse,
		GenericResponse extends ContractToResponse<GenericContractResponse>,
	>(
		handler: Handler<GenericFloorData, GenericRequest, GenericResponse>,
		responses?: GenericContractResponse | GenericContractResponse[],
		...desc: Description[]
	): Route<
		{
			method: HttpMethod;
			paths: string[];
			preflightSteps: GenericPreflightSteps[];
			steps: GenericSteps[];
			descriptions: Description[];
		},
		GenericRequest,
		GenericFloorData
	>;
}

export type AnyRouteBuilder = RouteBuilder<any, any, any, any, any>;

export function useRouteBuilder<
	GenericRequest extends CurrentRequestObject,
	GenericPreflightSteps extends PreflightStep = PreflightStep,
>(
	method: HttpMethod,
	paths: string[],
	preflightSteps?: GenericPreflightSteps[],
	desc: Description[] = [],
): RouteBuilder<GenericRequest> {
	function returnFunction(routeDefinition: RouteDefinition): AnyRouteBuilder {
		return {
			extract: (...args) => extract(simpleClone(routeDefinition), args),
			check: (...args) => check(simpleClone(routeDefinition), args),
			presetCheck: (...args) => presetCheck(simpleClone(routeDefinition), args),
			execute: (...args) => execute(simpleClone(routeDefinition), args),
			cut: (...args) => cut(simpleClone(routeDefinition), args),
			handler: (...args) => handler(simpleClone(routeDefinition), args),
		};
	}

	function extract(
		routeDefinition: RouteDefinition,
		[extractObject, catchError, ...desc]: Parameters<AnyRouteBuilder["extract"]>,
	) {
		routeDefinition.steps.push(
			new ExtractStep(
				extractObject,
				catchError,
				desc,
			),
		);

		return returnFunction(routeDefinition);
	}

	function check(
		routeDefinition: RouteDefinition,
		[checker, params, responses = [], ...desc]: Parameters<AnyRouteBuilder["check"]>,
	) {
		routeDefinition.steps.push(
			new CheckerStep(
				checker,
				<CheckerStepParams>params,
				responses instanceof Array ? responses : [responses],
				desc,
			),
		);

		return returnFunction(routeDefinition);
	}

	function presetCheck(
		routeDefinition: RouteDefinition,
		[presetChecker, input, ...desc]: Parameters<AnyRouteBuilder["presetCheck"]>,
	) {
		const transformInput = presetChecker.params.transformInput;

		return check(
			routeDefinition,
			[
				presetChecker.checker,
				{
					...presetChecker.params,
					input: transformInput
						? (pickup) => transformInput(input(pickup))
						: input,
				},
				presetChecker.responses,
				...desc,
			],
		);
	}

	function execute(
		routeDefinition: RouteDefinition,
		[process, params, ...desc]: Parameters<AnyRouteBuilder["execute"]>,
	) {
		routeDefinition.steps.push(
			new ProcessStep(
				process,
				params,
				desc,
			),
		);

		return returnFunction(routeDefinition);
	}

	function cut(
		routeDefinition: RouteDefinition,
		[cutFunction, drop = [], responses = [], ...desc]: Parameters<AnyRouteBuilder["cut"]>,
	) {
		routeDefinition.steps.push(
			new CutStep(
				cutFunction,
				drop instanceof Array ? drop : [drop],
				responses instanceof Array ? responses : [responses],
				desc,
			),
		);

		return returnFunction(routeDefinition);
	}

	function handler(
		routeDefinition: RouteDefinition,
		[handlerFunction, responses = [], ...desc]: Parameters<AnyRouteBuilder["handler"]>,
	) {
		routeDefinition.steps.push(
			new HandlerStep(
				handlerFunction,
				responses instanceof Array ? responses : [responses],
				desc,
			),
		);

		const route = new Route(routeDefinition);

		useBuilder.push(route);

		return route;
	}

	return returnFunction({
		paths: simpleClone(paths),
		method,
		preflightSteps: simpleClone(preflightSteps ?? []),
		steps: [],
		descriptions: desc,
	});
}

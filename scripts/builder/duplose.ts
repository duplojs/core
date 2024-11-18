import type { Description } from "@scripts/description";
import type { Process, GetProcessGeneric } from "@scripts/duplose/process";
import type { Floor } from "@scripts/floor";
import type { CurrentRequestObject } from "@scripts/request";
import { PreflightStep } from "@scripts/step/preflight";
import type { ProcessStepParams } from "@scripts/step/process";
import type { AddOne } from "@utils/incremente";
import { type AnyRouteBuilder, useRouteBuilder, type RouteBuilder } from "./route";
import type { Duplose } from "@scripts/duplose";
import { type HttpMethod } from "@scripts/duplose/route";
import { useProcessBuilder, type ProcessBuilder, type ProcessBuilderParams, type AnyProcessBuilder, type ProcessBuilderParamsToFloorData } from "./process";
import { simpleClone } from "@utils/simpleClone";
import type { Step } from "@scripts/step";

export interface Builder<
	GenericRequest extends CurrentRequestObject = CurrentRequestObject,
	GenericPreflightSteps extends PreflightStep = PreflightStep,
	GenericPreflightsCount extends number = 0,
	GenericFloorData extends object = object,
> {
	preflight<
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
	): Builder<
		GenericRequest & GenericProcessValue["request"],
		| GenericPreflightSteps
		| PreflightStep<GenericProcess, GenericPreflightsCount>,
		AddOne<GenericPreflightsCount>,
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

	createRoute<
		GenericLocalRequest extends CurrentRequestObject,
	>(
		method: HttpMethod,
		path: string | string[],
		...desc: Description[]
	): RouteBuilder<
		GenericRequest & GenericLocalRequest,
		GenericPreflightSteps,
		Step,
		0,
		GenericFloorData
	>;

	createProcess<
		GenericLocalRequest extends CurrentRequestObject,
		GenericProcessBuilderParams extends ProcessBuilderParams = ProcessBuilderParams,
	>(
		name: string,
		params?: GenericProcessBuilderParams,
		...desc: Description[]
	): ProcessBuilder<
		GenericRequest & GenericLocalRequest,
		GenericPreflightSteps,
		Step,
		0,
		GenericFloorData & ProcessBuilderParamsToFloorData<GenericProcessBuilderParams>
	>;

	preflightSteps: GenericPreflightSteps[];
}

export type AnyBuilder = Builder<any, any, any, any>;

export interface CreatedDuplose {
	duplose: Duplose;
	count: number;
}

const createdDuploseSymbol = Symbol("CreatedDuplose");

export function useBuilder<
	Request extends CurrentRequestObject = CurrentRequestObject,
>(): Builder<Request> {
	function returnFunction(preflightSteps: PreflightStep[]): AnyBuilder {
		return {
			preflight: (...args) => preflight(simpleClone(preflightSteps), args),
			createRoute: (...args) => createRoute(simpleClone(preflightSteps), args),
			createProcess: (...args) => createProcess(simpleClone(preflightSteps), args),
			preflightSteps,
		};
	}
	function createRoute(
		preflightSteps: PreflightStep[],
		[method, paths, ...desc]: Parameters<AnyBuilder["createRoute"]>,
	): AnyRouteBuilder {
		return useRouteBuilder(
			method,
			paths instanceof Array ? paths : [paths],
			preflightSteps,
			desc,
		);
	}

	function createProcess(
		preflightSteps: PreflightStep[],
		[name, params, ...desc]: Parameters<AnyBuilder["createProcess"]>,
	): AnyProcessBuilder {
		return useProcessBuilder(
			name,
			params,
			preflightSteps,
			desc,
		);
	}

	function preflight(
		preflightSteps: PreflightStep[],
		[process, params, ...desc]: Parameters<AnyBuilder["preflight"]>,
	): ReturnType<AnyBuilder["preflight"]> {
		preflightSteps.push(
			new PreflightStep(process, params, desc),
		);

		return returnFunction(preflightSteps);
	}

	return returnFunction([]);
}
useBuilder[createdDuploseSymbol] = new Set<CreatedDuplose>();
useBuilder.getAllCreatedDuplose = function *() {
	for (const createdDuplose of useBuilder[createdDuploseSymbol]) {
		createdDuplose.count++;
		yield createdDuplose.duplose;
	}
};
useBuilder.getLastCreatedDuploses = function *() {
	for (const createdDuplose of useBuilder[createdDuploseSymbol]) {
		if (createdDuplose.count) {
			continue;
		}
		createdDuplose.count++;
		yield createdDuplose.duplose;
	}
};
useBuilder.getFirstCreatedDuploses = function *() {
	for (const createdDuplose of useBuilder[createdDuploseSymbol]) {
		if (!createdDuplose.count) {
			continue;
		}
		createdDuplose.count++;
		yield createdDuplose.duplose;
	}
};
useBuilder.resetCreatedDuploses = function() {
	useBuilder[createdDuploseSymbol] = new Set<CreatedDuplose>();
};
useBuilder.push = function(
	duplose: Duplose,
) {
	useBuilder[createdDuploseSymbol].add({
		duplose,
		count: 0,
	});
};

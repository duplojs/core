import type { Description } from "@scripts/description";
import { Process, type GetProcessGeneric } from "@scripts/duplose/process";
import type { Floor } from "@scripts/floor";
import type { CurrentRequestObject } from "@scripts/request";
import { PreflightStep } from "@scripts/step/preflight";
import type { ProcessStepParams } from "@scripts/step/process";
import type { AddOne } from "@utils/incremente";
import { type AnyRouteBuilder, useRouteBuilder, type RouteBuilder } from "./route";
import type { Duplose, ExtractObject } from "@scripts/duplose";
import { type HttpMethod, Route } from "@scripts/duplose/route";
import { useProcessBuilder, type ProcessBuilder, type ProcessBuilderParams, type AnyProcessBuilder, type ProcessBuilderParamsToFloorData } from "./process";

export interface Builder<
	Request extends CurrentRequestObject = CurrentRequestObject,
	Preflights extends PreflightStep = never,
	PreflightsCount extends number = 0,
	FloorData extends object = object,
> {
	preflight<
		P extends Process,
		T extends string,
		F extends ((floor: Floor<FloorData>["pickup"]) => boolean) | undefined,
		GPG extends GetProcessGeneric<P> = GetProcessGeneric<P>,
	>(
		process: P,
		params?: ProcessStepParams<
			GPG,
			T,
			FloorData,
			F
		>,
		...desc: Description[]
	): Builder<
		Request & GPG["request"],
		| Preflights
		| PreflightStep<P, PreflightsCount>,
		AddOne<PreflightsCount>,
		(
			undefined extends F
				? Pick<GPG["floor"], T extends keyof GPG["floor"] ? T : never>
				: Partial<Pick<GPG["floor"], T extends keyof GPG["floor"] ? T : never>>
		) & (
			string extends T
				? FloorData
				: Omit<FloorData, T>
		)
	>;

	createRoute<
		R extends CurrentRequestObject = CurrentRequestObject,
	>(
		method: HttpMethod,
		path: string | string[],
		...desc: Description[]
	): RouteBuilder<
		Request & R,
		Preflights,
		ExtractObject,
		never,
		0,
		FloorData
	>;

	createProcess<
		R extends CurrentRequestObject = CurrentRequestObject,
		P extends ProcessBuilderParams = ProcessBuilderParams,
		D extends ProcessBuilderParamsToFloorData<P> = ProcessBuilderParamsToFloorData<P>,
	>(
		name: string,
		params?: P,
		...desc: Description[]
	): ProcessBuilder<
		Request & R,
		D["options"],
		D["input"],
		never,
		ExtractObject,
		never,
		0,
		FloorData & D
	>;

	preflightSteps: Preflights[];
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
	function createRoute(
		method: HttpMethod,
		path: string | string[],
		preflightSteps: PreflightStep[],
		desc: Description[],
	): AnyRouteBuilder {
		const route = new Route(
			method,
			path instanceof Array ? path : [path],
			desc,
		);

		route.addPreflightSteps(...preflightSteps);

		useBuilder[createdDuploseSymbol].add({
			duplose: route,
			count: 0,
		});

		return useRouteBuilder(route);
	}

	function createProcess(
		name: string,
		params: ProcessBuilderParams | undefined,
		preflightSteps: PreflightStep[],
		desc: Description[],
	): AnyProcessBuilder {
		const process = new Process(
			name,
			desc,
		);

		process.addPreflightSteps(...preflightSteps);

		useBuilder[createdDuploseSymbol].add({
			duplose: process,
			count: 0,
		});

		return useProcessBuilder(process, params);
	}

	function preflight(
		process: Process,
		params?: ProcessStepParams,
		lastPreflights: PreflightStep[] = [],
		desc: Description[] = [],
	): ReturnType<AnyBuilder["preflight"]> {
		const preflightStep = new PreflightStep(process, params, desc);
		const preflightSteps = [...lastPreflights, preflightStep];

		return {
			preflight(process, params, ...desc) {
				return preflight(
					process,
					params,
					preflightSteps,
					desc,
				);
			},
			createRoute(method, path, ...desc) {
				return createRoute(method, path, preflightSteps, desc);
			},
			createProcess(name, params, ...desc) {
				return createProcess(name, params, preflightSteps, desc);
			},
			preflightSteps,
		};
	}

	return {
		preflight(process, params, ...desc) {
			return preflight(
				process,
				params,
				[],
				desc,
			);
		},
		createRoute(method, path, ...desc) {
			return createRoute(method, path, [], desc);
		},
		createProcess(name, params, ...desc) {
			return createProcess(name, params, [], desc);
		},
		preflightSteps: [],
	} satisfies AnyBuilder as any;
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

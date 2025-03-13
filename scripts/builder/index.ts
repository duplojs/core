import type { Description } from "@scripts/description";
import type { Process, GetProcessGeneric } from "@scripts/duplose/process";
import type { Floor } from "@scripts/floor";
import type { CurrentRequestObject } from "@scripts/request";
import { PreflightStep } from "@scripts/step/preflight";
import type { ProcessStepParams } from "@scripts/step/process";
import { type AnyRouteBuilder, useRouteBuilder, type RouteBuilder } from "./route";
import { type RouteDefinition, type HttpMethod } from "@scripts/duplose/route";
import type { Step } from "@scripts/step";
import { type AddOne, type MergeObjects, simpleClone } from "@duplojs/utils";

export type PartialRouteDefinition = Pick<RouteDefinition, "preflightSteps" | "descriptions">;

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
		MergeObjects<
			GenericFloorData,
			undefined extends GenericSkip
				? Pick<
					GenericPickup extends keyof GenericProcessValue["floor"] ? GenericProcessValue["floor"] : object,
					GenericPickup extends keyof GenericProcessValue["floor"] ? GenericPickup : never
				>
				: Partial<
					Pick<
						GenericPickup extends keyof GenericProcessValue["floor"] ? GenericProcessValue["floor"] : object,
						GenericPickup extends keyof GenericProcessValue["floor"] ? GenericPickup : never
					>
				>
		>
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

	definition: PartialRouteDefinition;
}

export type AnyBuilder = Builder<any, any, any, any>;

export function useBuilder<
	Request extends CurrentRequestObject = CurrentRequestObject,
>(...desc: Description[]): Builder<Request> {
	function returnFunction(definition: PartialRouteDefinition): AnyBuilder {
		return {
			preflight: (...args) => preflight(simpleClone(definition), args),
			createRoute: (...args) => createRoute(simpleClone(definition), args),
			definition,
		};
	}
	function createRoute(
		{ preflightSteps, descriptions }: PartialRouteDefinition,
		[method, paths, ...desc]: Parameters<AnyBuilder["createRoute"]>,
	): AnyRouteBuilder {
		return useRouteBuilder(
			method,
			paths instanceof Array ? paths : [paths],
			preflightSteps,
			[...descriptions, ...desc],
		);
	}

	function preflight(
		definition: PartialRouteDefinition,
		[process, params, ...desc]: Parameters<AnyBuilder["preflight"]>,
	): ReturnType<AnyBuilder["preflight"]> {
		definition.preflightSteps.push(
			new PreflightStep(process, params, desc),
		);

		return returnFunction(definition);
	}

	return returnFunction({
		preflightSteps: [],
		descriptions: desc,
	});
}

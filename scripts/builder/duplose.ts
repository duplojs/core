import type { Description } from "@scripts/description";
import type { Process, GetProcessGeneric } from "@scripts/duplose/process";
import type { Floor } from "@scripts/floor";
import type { CurrentRequestObject, HttpMethod } from "@scripts/request";
import { PreflightStep } from "@scripts/step/preflight";
import type { ProcessStepParams } from "@scripts/step/process";
import type { AddOne } from "@utils/incremente";
import { useRouteBuilder, type RouteBuilder } from "./route";
import type { ExtractObject } from "@scripts/duplose";
import { Route } from "@scripts/duplose/route";

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
			T extends keyof GPG["floor"]
				? undefined extends F
					? Pick<GPG["floor"], T>
					: Partial<Pick<GPG["floor"], T>>
				: object
		) & (
			string extends T
				? FloorData
				: Omit<FloorData, T>
		)
	>;

	createRoute<
		RouteRequest extends CurrentRequestObject = CurrentRequestObject,
	>(
		method: HttpMethod,
		path: string[],
		...desc: Description[]
	): RouteBuilder<
		Request & RouteRequest,
		Preflights,
		ExtractObject,
		never,
		0,
		FloorData
	>;
}

export type AnyBuilder = Builder<any, any, any, any>;

export function useBuilder<
	Request extends CurrentRequestObject = CurrentRequestObject,
>(): Builder<Request> {
	function preflight(
		process: Process,
		params?: ProcessStepParams,
		preflights: PreflightStep[] = [],
		...desc: Description[]
	): ReturnType<AnyBuilder["preflight"]> {
		const preflightStep = new PreflightStep(process, params, desc);

		return {
			preflight: (arg1, arg2, ...desc) => preflight(
				arg1,
				arg2,
				[...preflights, preflightStep],
				desc,
			),
			createRoute: (method, path, ...desc) => {
				const route = new Route(method, path, desc);
				route.addPreflight(...preflights, preflightStep);
				return useRouteBuilder(route);
			},
		};
	}

	return {
		preflight: (arg1, arg2, ...desc) => preflight(
			arg1 as Process,
			arg2 as ProcessStepParams,
			[],
			desc,
		),
		createRoute: (method, path, ...desc) => {
			const route = new Route(method, path, desc);

			return useRouteBuilder(route);
		},
	};
}

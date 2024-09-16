/* eslint-disable func-style */
/* eslint-disable @typescript-eslint/no-use-before-define */
import type { Checker, GetCheckerGeneric } from "@scripts/checker";
import type { Description } from "@scripts/description";
import type { DefineHooksRouteLifeCycle, ExtractErrorFunction, ExtractObject } from "@scripts/duplose";
import type { Route } from "@scripts/duplose/route";
import type { CurrentRequestObject } from "@scripts/request";
import type { Step } from "@scripts/step";
import type { PreflightStep } from "@scripts/step/preflight";
import type { FlatExtract } from "@utils/flatExtract";
import type { PresetChecker, GetPresetCheckerGeneric } from "./checker";
import type { ContractResponse, ContractToResponse } from "@scripts/response";
import type { AddOne } from "@utils/incremente";
import { CheckerStep, type CheckerStepParams } from "@scripts/step/checker";
import type { Floor } from "@scripts/floor";
import { ProcessStep, type ProcessStepParams } from "@scripts/step/process";
import type { GetProcessGeneric, Process } from "@scripts/duplose/process";
import { CutStep, type Cut } from "@scripts/step/cut";
import { HandlerStep, type Handler } from "@scripts/step/handler";
import type { AnyFunction } from "@utils/types";

export interface RouteBuilder<
	Request extends CurrentRequestObject = CurrentRequestObject,
	Preflights extends PreflightStep = never,
	Extracted extends ExtractObject = ExtractObject,
	Steps extends Step = never,
	StepsCount extends number = 0,
	FloorData extends object = object,
> {
	hook: DefineHooksRouteLifeCycle<
		Request,
		this
	>;

	extract<
		E extends ExtractObject<Request>,
		F extends FlatExtract<E>,
	>(
		extract: E,
		error?: ExtractErrorFunction,
		...desc: Description[]
	): Omit<
		RouteBuilder<
			Request,
			Preflights,
			E,
			Steps,
			StepsCount,
			Omit<FloorData, keyof F> & NoInfer<F>
		>,
		"extract" | "hook"
	>;

	check<
		C extends Checker,
		I extends string,
		K extends string,
		F extends ((floor: Floor<FloorData>["pickup"]) => boolean) | undefined,
		R extends ContractResponse,
		CR extends ContractToResponse<R> = ContractToResponse<R>,
		GCG extends GetCheckerGeneric<C> = GetCheckerGeneric<C>,
	>(
		checker: C,
		params: CheckerStepParams<
			GCG,
			I,
			K,
			CR,
			FloorData,
			F
		>,
		responses?: R | R[],
		...desc: Description[]
	): Omit<
		RouteBuilder<
			Request,
			Preflights,
			Extracted,
			Steps | CheckerStep<C, R, StepsCount>,
			AddOne<StepsCount>,
			(
				string extends K
					? object
					: { [P in K]: Extract<GCG["output"], { info: I }>["data"] | (undefined extends F ? never : undefined) }
			) & (
				string extends I
					? FloorData
					: Omit<FloorData, I>
			)
		>,
		"extract" | "hook"
	>;

	presetCheck<
		C extends PresetChecker,
		GCPG extends GetPresetCheckerGeneric<C> = GetPresetCheckerGeneric<C>,
		GCG extends GetCheckerGeneric<GCPG["checker"]> = GetCheckerGeneric<GCPG["checker"]>,
	>(
		presetChecker: C,
		input: (pickup: Floor<FloorData>["pickup"]) => GCPG["newInput"],
		...desc: Description[]
	): Omit<
		RouteBuilder<
			Request,
			Preflights,
			Extracted,
			Steps | CheckerStep<GCPG["checker"], GCPG["response"], StepsCount>,
			AddOne<StepsCount>,
			(
				string extends GCPG["key"]
					? object
					: { [P in GCPG["key"]]: Extract<GCG["output"], { info: GCPG["info"] }>["data"] }
			) & (
				string extends GCPG["key"]
					? FloorData
					: Omit<FloorData, GCPG["key"]>
			)
		>,
		"extract" | "hook"
	>;

	execute<
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
	): Omit<
		RouteBuilder<
			Request & GPG["request"],
			Preflights,
			Extracted,
			Steps | ProcessStep<P, StepsCount>,
			AddOne<StepsCount>,
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
		>,
		"extract" | "hook"
	>;

	cut<
		R extends ContractResponse,
		CR extends ContractToResponse<R>,
		T extends Record<string, unknown> | CR,
		O extends Exclude<T, CR>,
		D extends string,
	>(
		cutFunction: Cut<
			FloorData,
			Request,
			CR | T
		>,
		drop?: D[] & NoInfer<keyof O>[],
		responses?: R | R[],
		...desc: Description[]
	): Omit<
		RouteBuilder<
			Request,
			Preflights,
			Extracted,
			Steps | CutStep<R, StepsCount>,
			AddOne<StepsCount>,
			(
				string extends D
					? FloorData
					: Omit<FloorData, D> & Pick<O, D>
			)
		>,
		"extract" | "hook"
	>;

	handler<
		R extends ContractResponse,
		CR extends ContractToResponse<R> = ContractToResponse<R>,
	>(
		handler: Handler<FloorData, Request, CR>,
		responses?: R | R[],
		...desc: Description[]
	): Route<
		Request,
		Preflights,
		Extracted,
		Steps | HandlerStep<R, StepsCount>,
		FloorData
	>;
}

export type AnyRouteBuilder = RouteBuilder<any, any, any, any, any, any>;

export function useRouteBuilder<
	Request extends CurrentRequestObject = CurrentRequestObject,
>(
	route: Route,
): RouteBuilder<Request> {
	const hook: AnyRouteBuilder["hook"] = (
		...[name, subscriber]
	) => {
		route.hooks[name].addSubscriber(subscriber as AnyFunction);

		return {
			extract,
			check,
			presetCheck,
			execute,
			cut,
			handler,
			hook,
		};
	};

	const extract: AnyRouteBuilder["extract"] = (
		extract,
		error,
		...desc
	) => {
		route.setExtract(extract, error, desc);

		return {
			check,
			presetCheck,
			execute,
			cut,
			handler,
		};
	};

	const check: AnyRouteBuilder["check"] = (
		checker,
		params: CheckerStepParams,
		responses = [],
		...desc
	) => {
		route.addStep(
			new CheckerStep(
				checker,
				params,
				responses instanceof Array ? responses : [responses],
				desc,
			),
		);

		return {
			check,
			presetCheck,
			execute,
			cut,
			handler,
		};
	};

	const presetCheck: AnyRouteBuilder["presetCheck"] = (
		presetChecker,
		input,
		...desc
	) => {
		const transformInput = presetChecker.params.transformInput;

		return check(
			presetChecker.checker,
			{
				...presetChecker.params,
				input: transformInput
					? (pickup) => transformInput(input(pickup))
					: input,
			},
			presetChecker.responses,
			...desc,
		);
	};

	const execute: AnyRouteBuilder["execute"] = (
		process,
		params,
		...desc
	) => {
		route.addStep(
			new ProcessStep(
				process,
				params,
				desc,
			),
		);

		return {
			check,
			presetCheck,
			execute,
			cut,
			handler,
		};
	};

	const cut: AnyRouteBuilder["cut"] = (
		cutFunction: Cut,
		drop: string | string[] = [],
		responses: ContractResponse | ContractResponse[] = [],
		...desc: Description[]
	) => {
		route.addStep(
			new CutStep(
				cutFunction,
				drop instanceof Array ? drop : [drop],
				responses instanceof Array ? responses : [responses],
				desc,
			),
		);

		return {
			check,
			presetCheck,
			execute,
			cut,
			handler,
		};
	};

	const handler: AnyRouteBuilder["handler"] = (
		handlerFunction: Handler,
		responses: ContractResponse | ContractResponse[] = [],
		...desc: Description[]
	) => {
		route.addStep(
			new HandlerStep(
				handlerFunction,
				responses instanceof Array ? responses : [responses],
				desc,
			),
		);

		return route;
	};

	return {
		extract,
		check,
		presetCheck,
		execute,
		cut,
		handler,
		hook,
	} satisfies AnyRouteBuilder as any;
}

/* eslint-disable @typescript-eslint/no-use-before-define */
import type { Checker, GetCheckerGeneric } from "@scripts/checker";
import type { Description } from "@scripts/description";
import type { ExtractErrorFunction, ExtractObject } from "@scripts/duplose";
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
import type { AnyFunction } from "@utils/types";
import type { DefineHooksRouteLifeCycle } from "@scripts/hook";

export interface ProcessBuilder<
	Request extends CurrentRequestObject = CurrentRequestObject,
	Options extends object | undefined = undefined,
	Input extends unknown = undefined,
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
	>(
		extract: E,
		error?: ExtractErrorFunction,
		...desc: Description[]
	): Omit<
		ProcessBuilder<
			Request,
			Options,
			Input,
			Preflights,
			E,
			Steps,
			StepsCount,
			FloorData & FlatExtract<E>
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
		ProcessBuilder<
			Request,
			Options,
			Input,
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
		input: (pickup: Floor<FloorData>["pickup"]) => unknown extends GCPG["newInput"] ? GCG["input"] : GCPG["newInput"],
		...desc: Description[]
	): Omit<
		ProcessBuilder<
			Request,
			Options,
			Input,
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
		ProcessBuilder<
			Request & GPG["request"],
			Options,
			Input,
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
		ProcessBuilder<
			Request,
			Options,
			Input,
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

	exportation<
		D extends string,
	>(
		drop?: D[] & (keyof FloorData)[],
		...desc: Description[]
	): Process<
		Request,
		Options,
		Input,
		D extends keyof FloorData
			? D
			: never,
		Preflights,
		Extracted,
		Steps,
		FloorData
	>;
}

export interface ProcessBuilderParams<
	Options extends object = object,
	Input extends unknown = unknown,
> {
	options?: Options;
	input?: Input;
}

export interface ProcessBuilderParamsToFloorData<P extends ProcessBuilderParams> {
	options: object extends P["options"]
		? undefined
		: P["options"];
	input: unknown extends P["input"]
		? undefined
		: P["input"];
}

export type AnyProcessBuilder = ProcessBuilder<any, any, any, any, any, any, any, any>;

export function useProcessBuilder<
	Request extends CurrentRequestObject,
	Params extends ProcessBuilderParams = ProcessBuilderParams,
	FloorData extends ProcessBuilderParamsToFloorData<Params> = ProcessBuilderParamsToFloorData<Params>,
>(
	process: Process,
	params?: Params,
): ProcessBuilder<
		Request,
		FloorData["options"],
		FloorData["input"],
		never,
		ExtractObject,
		never,
		0,
		FloorData
	> {
	if (params?.options) {
		process.setOptions(params?.options);
	}

	if (params?.input) {
		process.setInput(params?.input);
	}

	function hook(
		...[name, subscriber]: Parameters<DefineHooksRouteLifeCycle>
	): ReturnType<AnyProcessBuilder["hook"]> {
		process.hooks[name].addSubscriber(subscriber as AnyFunction);

		return {
			extract,
			check,
			presetCheck,
			execute,
			cut,
			hook,
			exportation,
		};
	}

	function extract(
		extract: ExtractObject,
		error?: ExtractErrorFunction,
		...desc: Description[]
	): ReturnType<AnyProcessBuilder["extract"]> {
		process.setExtract(extract, error, desc);

		return {
			check,
			presetCheck,
			execute,
			cut,
			exportation,
		};
	}

	function check(
		checker: Checker,
		params: CheckerStepParams,
		responses: ContractResponse | ContractResponse[] = [],
		...desc: Description[]
	): ReturnType<AnyProcessBuilder["check"]> {
		process.addStep(
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
			exportation,
		};
	}

	function presetCheck(
		presetChecker: PresetChecker,
		input: AnyFunction,
		...desc: Description[]
	): ReturnType<AnyProcessBuilder["presetCheck"]> {
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
	}

	function execute(
		currentProcess: Process,
		params?: ProcessStepParams,
		...desc: Description[]
	): ReturnType<AnyProcessBuilder["execute"]> {
		process.addStep(
			new ProcessStep(
				currentProcess,
				params,
				desc,
			),
		);

		return {
			check,
			presetCheck,
			execute,
			cut,
			exportation,
		};
	}

	function cut(
		cutFunction: Cut,
		drop: string | string[] = [],
		responses: ContractResponse | ContractResponse[] = [],
		...desc: Description[]
	): ReturnType<AnyProcessBuilder["cut"]> {
		process.addStep(
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
			exportation,
		};
	}

	function exportation(
		drop: string[] = [],
		...desc: Description[]
	): ReturnType<AnyProcessBuilder["exportation"]> {
		process.setDrop(drop, desc);

		return process;
	}

	return {
		extract,
		check,
		presetCheck,
		execute,
		cut,
		exportation,
		hook,
	} satisfies AnyProcessBuilder as any;
}

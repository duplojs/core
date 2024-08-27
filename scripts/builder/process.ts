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
	extract<
		E extends ExtractObject,
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
		"extract"
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
			Steps | CheckerStep<C, CR, StepsCount>,
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
		"extract"
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
		"extract"
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
		"extract"
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
			Steps | CutStep<CR, StepsCount>,
			AddOne<StepsCount>,
			(
				string extends D
					? FloorData
					: Omit<FloorData, D> & Pick<O, D>
			)
		>,
		"extract"
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

interface ProcessBuilderParams<
	Options extends object | undefined = undefined,
	Input extends unknown = undefined,
> {
	options?: Options;
	input?: Input;
}

export function useProcessBuilder<
	Request extends CurrentRequestObject,
	Options extends object | undefined = undefined,
	Input extends unknown = undefined,
>(
	process: Process,
	params?: ProcessBuilderParams<
		Options,
		Input
	>,
) {
	if (params?.options) {
		process.setOptions(params?.options);
	}

	if (params?.input) {
		process.setInput(params?.input);
	}

	function extract(
		extract: ExtractObject,
		error?: ExtractErrorFunction,
		...desc: Description[]
	) {
		process.setExtract(extract, error, desc);

		return {
			check,
			presetCheck,
			execute,
			cut,
			exportation,
		} as ReturnType<ProcessBuilder<Request>["extract"]>;
	}

	function check(
		checker: Checker,
		params: CheckerStepParams,
		responses: ContractResponse | ContractResponse[] = [],
		...desc: Description[]
	) {
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
		} as ReturnType<ProcessBuilder<Request>["check"]>;
	}

	function presetCheck(
		presetChecker: PresetChecker,
		input: AnyFunction,
		...desc: Description[]
	) {
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
		) as ReturnType<ProcessBuilder<Request>["presetCheck"]>;
	}

	function execute(
		process: Process,
		params?: ProcessStepParams,
		...desc: Description[]
	) {
		process.addStep(
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
			exportation,
		} as ReturnType<ProcessBuilder<Request>["execute"]>;
	}

	function cut(
		cutFunction: Cut,
		drop: string | string[] = [],
		responses: ContractResponse | ContractResponse[] = [],
		...desc: Description[]
	) {
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
		} as ReturnType<ProcessBuilder<Request>["cut"]>;
	}

	function exportation(
		drop: string[] = [],
		...desc: Description[]
	) {
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
	} as ProcessBuilder<
		Request,
		Options,
		Input,
		never,
		ExtractObject,
		never,
		0,
		{
			options: Options;
			input: Input;
		}
	>;
}

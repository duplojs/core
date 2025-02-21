
import type { Checker, GetCheckerGeneric } from "@scripts/checker";
import type { Description } from "@scripts/description";
import type { CurrentRequestObject } from "@scripts/request";
import type { Step } from "@scripts/step";
import type { PreflightStep } from "@scripts/step/preflight";
import type { FlatExtract } from "@utils/flatExtract";
import type { PresetChecker, GetPresetCheckerGeneric } from "./checker";
import type { ContractResponse, ContractToResponse } from "@scripts/response";
import { CheckerStep, type CheckerStepParams } from "@scripts/step/checker";
import type { DroppedValue, Floor } from "@scripts/floor";
import { ProcessStep, type ProcessStepParams } from "@scripts/step/process";
import { type GetProcessGeneric, Process, type ProcessDefinition } from "@scripts/duplose/process";
import { type Cut, CutStep } from "@scripts/step/cut";
import { ExtractStep, type ExtractErrorFunction, type ExtractObject } from "@scripts/step/extract";
import { type AddOne, simpleClone } from "@duplojs/utils";

export interface ProcessBuilder<
	GenericRequest extends CurrentRequestObject = CurrentRequestObject,
	GenericSteps extends Step = Step,
	GenericStepsCount extends number = 0,
	GenericFloorData extends object & { options?: object } = object & { options?: object },
> {
	extract<
		GenericExtract extends ExtractObject<GenericRequest>,
		GenericFlatExtract extends FlatExtract<GenericExtract>,
	>(
		extract: GenericExtract,
		catchError?: ExtractErrorFunction,
		...desc: Description[]
	): ProcessBuilder<
		GenericRequest,
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
	): ProcessBuilder<
		GenericRequest,
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
	): ProcessBuilder<
		GenericRequest,
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
	): ProcessBuilder<
		GenericRequest & GenericProcessValue["request"],
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
	): ProcessBuilder<
		GenericRequest,
		GenericSteps | CutStep<GenericContractResponse, GenericStepsCount>,
		AddOne<GenericStepsCount>,
		(
			string extends GenericDrop
				? GenericFloorData
				: Omit<GenericFloorData, GenericDrop> & Pick<GenericDroppedValue, GenericDrop>
		)
	>;

	exportation<
		GenericDrop extends string,
	>(
		drop?: GenericDrop[] & (keyof GenericFloorData)[],
		...desc: Description[]
	): Process<
		{
			name: string;
			options: "options" extends keyof GenericFloorData
				? GenericFloorData["options"]
				: undefined;
			input: "input" extends keyof GenericFloorData
				? GenericFloorData["input"]
				: undefined;
			drop: GenericDrop[];
			steps: GenericSteps[];
			descriptions: Description[];
		},
		GenericRequest,
		GenericFloorData
	>;
}

export interface ProcessBuilderParams {
	options?: object;
	input?: unknown;
}

export interface ProcessBuilderParamsToFloorData<GenericProcessBuilderParams extends ProcessBuilderParams> {
	options: undefined extends GenericProcessBuilderParams["options"]
		? undefined
		: GenericProcessBuilderParams["options"];
	input: undefined extends GenericProcessBuilderParams["input"]
		? undefined
		: GenericProcessBuilderParams["input"];
}

export type AnyProcessBuilder = ProcessBuilder<any, any, any, any>;

const createdProcessSymbol = Symbol("CreatedProcess");

export function useProcessBuilder<
	GenericRequest extends CurrentRequestObject,
	GenericParams extends ProcessBuilderParams = ProcessBuilderParams,
>(
	name: string,
	params: GenericParams | undefined,
	desc: Description[],
): ProcessBuilder<
		GenericRequest,
		PreflightStep,
		0,
		ProcessBuilderParamsToFloorData<GenericParams>
	> {
	function returnFunction(processDefinition: ProcessDefinition): AnyProcessBuilder {
		return {
			extract: (...args) => extract(simpleClone(processDefinition), args),
			check: (...args) => check(simpleClone(processDefinition), args),
			presetCheck: (...args) => presetCheck(simpleClone(processDefinition), args),
			execute: (...args) => execute(simpleClone(processDefinition), args),
			cut: (...args) => cut(simpleClone(processDefinition), args),
			exportation: (...args) => exportation(simpleClone(processDefinition), args),
		};
	}

	function extract(
		processDefinition: ProcessDefinition,
		[extractObject, catchError, ...desc]: Parameters<AnyProcessBuilder["extract"]>,
	) {
		processDefinition.steps.push(
			new ExtractStep(
				extractObject,
				catchError,
				desc,
			),
		);

		return returnFunction(processDefinition);
	}

	function check(
		processDefinition: ProcessDefinition,
		[checker, params, responses = [], ...desc]: Parameters<AnyProcessBuilder["check"]>,
	) {
		processDefinition.steps.push(
			new CheckerStep(
				checker,
					<CheckerStepParams>params,
					responses instanceof Array ? responses : [responses],
					desc,
			),
		);

		return returnFunction(processDefinition);
	}

	function presetCheck(
		processDefinition: ProcessDefinition,
		[presetChecker, input, ...desc]: Parameters<AnyProcessBuilder["presetCheck"]>,
	) {
		const transformInput = presetChecker.params.transformInput;

		return check(
			processDefinition,
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
		processDefinition: ProcessDefinition,
		[process, params, ...desc]: Parameters<AnyProcessBuilder["execute"]>,
	) {
		processDefinition.steps.push(
			new ProcessStep(
				process,
				params,
				desc,
			),
		);

		return returnFunction(processDefinition);
	}

	function cut(
		processDefinition: ProcessDefinition,
		[cutFunction, drop = [], responses = [], ...desc]: Parameters<AnyProcessBuilder["cut"]>,
	) {
		processDefinition.steps.push(
			new CutStep(
				cutFunction,
				drop instanceof Array ? drop : [drop],
				responses instanceof Array ? responses : [responses],
				desc,
			),
		);

		return returnFunction(processDefinition);
	}

	function exportation(
		processDefinition: ProcessDefinition,
		[drop = [], ...desc]: Parameters<AnyProcessBuilder["exportation"]>,
	) {
		const process = new Process({
			...processDefinition,
			drop: <string[]>drop,
			descriptions: [...processDefinition.descriptions, ...desc],
		});

		useProcessBuilder[createdProcessSymbol].add(process);

		return process as Process<any>;
	}

	return returnFunction({
		name,
		steps: [],
		drop: [],
		descriptions: desc,
		...params,
	});
}

useProcessBuilder[createdProcessSymbol] = new Set<Process>();

useProcessBuilder.getAllCreatedProcess = function *() {
	yield *useProcessBuilder[createdProcessSymbol];
};

useProcessBuilder.resetCreatedProcess = function() {
	useProcessBuilder[createdProcessSymbol] = new Set();
};

export function createProcess<
	GenericLocalRequest extends CurrentRequestObject,
	GenericProcessBuilderParams extends ProcessBuilderParams = ProcessBuilderParams,
>(
	name: string,
	params?: GenericProcessBuilderParams,
	...desc: Description[]
) {
	return useProcessBuilder<
		GenericLocalRequest,
		GenericProcessBuilderParams
	>(
		name,
		params,
		desc,
	);
}

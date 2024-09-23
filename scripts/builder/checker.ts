import { Checker, type CheckerHandler, type GetCheckerGeneric } from "@scripts/checker";
import type { CheckerStepParams } from "@scripts/step/checker";
import type { ContractResponse, ContractToResponse, PresetGeneriqueResponse } from "@scripts/response";

export function createChecker<
	GenericOptions extends object | undefined = undefined,
>(
	name: string,
	options: GenericOptions = undefined as GenericOptions,
) {
	const checker = new Checker(name);
	checker.setOptions(options);

	return {
		handler<
			H extends CheckerHandler<GenericOptions>,
		>(handler: H) {
			checker.setHandler(handler);

			return checker as Checker<
				GenericOptions,
				Parameters<H>[0],
				Awaited<ReturnType<H>>
			>;
		},
	};
}

export interface PresetCheckerParams<
	GenericCheckerGeneric extends GetCheckerGeneric = GetCheckerGeneric,
	GenericInfo extends string = string,
	GenericKey extends string = string,
	GenericResponse extends PresetGeneriqueResponse = PresetGeneriqueResponse,
	GenericNewInput extends unknown = GenericCheckerGeneric["input"],
> extends
	Pick<
		CheckerStepParams<
			GenericCheckerGeneric,
			GenericInfo,
			GenericKey,
			GenericResponse
		>,
		"result" | "catch" | "indexing"
	> {
	transformInput?(input: GenericNewInput): GenericCheckerGeneric["input"];
	options?: Partial<GenericCheckerGeneric["options"]>;
}

export class PresetChecker<
	GenericChecker extends Checker = Checker,
	GenericInfo extends string = string,
	GenericKey extends string = string,
	GenericContractResponse extends ContractResponse = ContractResponse,
	GenericNewInput extends unknown = unknown,
	_GenericCheckerGeneric extends GetCheckerGeneric<GenericChecker> = GetCheckerGeneric<GenericChecker>,
	_GenericOutputData extends unknown = Extract<_GenericCheckerGeneric["output"], { info: GenericInfo }>["data"],
> {
	public constructor(
		public checker: GenericChecker,
		public params: PresetCheckerParams<
			GetCheckerGeneric<GenericChecker>,
			GenericInfo,
			GenericKey,
			ContractToResponse<GenericContractResponse>,
			GenericNewInput
		>,
		public responses: GenericContractResponse[],
	) {}

	public rewriteIndexing<
		GenericKey extends string,
	>(indexing: GenericKey) {
		return new PresetChecker<
			GenericChecker,
			GenericInfo,
			GenericKey,
			GenericContractResponse,
			GenericNewInput
		>(
			this.checker,
			{
				...this.params,
				indexing,
			},
			this.responses,
		);
	}

	public transformInput<
		GenericNewInput extends unknown,
	>(
		transformInput: (input: GenericNewInput) => _GenericCheckerGeneric["input"],
	) {
		return new PresetChecker<
			GenericChecker,
			GenericInfo,
			GenericKey,
			GenericContractResponse,
			GenericNewInput
		>(
			this.checker,
			{
				...this.params,
				transformInput,
			},
			this.responses,
		);
	}
}

export function createPresetChecker<
	GenericChecker extends Checker,
	GenericInfo extends string,
	GenericKey extends string,
	GenericContractResponse extends ContractResponse,
	GenericNewInput extends unknown,
>(
	checker: GenericChecker,
	params: PresetCheckerParams<
		GetCheckerGeneric<GenericChecker>,
		GenericInfo,
		GenericKey,
		ContractToResponse<GenericContractResponse>,
		GenericNewInput
	>,
	responses: GenericContractResponse | GenericContractResponse[],

) {
	return new PresetChecker<
		GenericChecker,
		GenericInfo,
		GenericKey,
		GenericContractResponse,
		GenericNewInput
	>(
		checker,
		params,
		responses instanceof Array ? responses : [responses],
	);
}

export type GetPresetCheckerGeneric<
	GenericPresetChecker extends PresetChecker,
> =
	GenericPresetChecker extends PresetChecker<
		infer InferedChecker,
		infer InferedInfo,
		infer InferedKey,
		infer InferedContractResponse,
		infer InferedNewInput,
		infer InferedCheckerGeneric,
		infer InferedOutputData
	>
		? {
			checker: InferedChecker;
			info: InferedInfo;
			key: InferedKey;
			response: InferedContractResponse;
			newInput: InferedNewInput;
			checkerGeneric: InferedCheckerGeneric;
			outputData: InferedOutputData;
		}
		: never;


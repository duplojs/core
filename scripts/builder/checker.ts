import { Checker, type CheckerHandler, type GetCheckerGeneric } from "@scripts/checker";
import type { CheckerStepParams } from "@scripts/step/checker";
import type { ContractResponse, ContractToResponse, Response } from "@scripts/response";

export function createChecker<
	T extends object | undefined = undefined,
>(name: string, options: T) {
	const checker = new Checker(name);
	checker.setOptions(options);

	return {
		handler<
			H extends CheckerHandler<T>,
		>(handler: H) {
			checker.setHandler(handler);

			return checker as Checker<
				T,
				Parameters<H>[0],
				Awaited<ReturnType<H>>
			>;
		},
	};
}

export interface PresetCheckerParams<
	CheckerGeneric extends GetCheckerGeneric = GetCheckerGeneric,
	Info extends string = string,
	Key extends string = string,
	CatchResponse extends Response = Response,
	NewInput extends unknown = CheckerGeneric["input"],
> extends
	Pick<
		CheckerStepParams<CheckerGeneric, Info, Key, CatchResponse>,
		"result" | "catch" | "indexing"
	> {
	transformInput?(input: NewInput): CheckerGeneric["input"];
	options?: Partial<CheckerGeneric["options"]>;
}

export class PresetChecker<
	_Checker extends Checker = Checker,
	_Info extends string = string,
	_Key extends string = string,
	_Response extends Response = Response,
	_NewInput extends unknown = unknown,
> {
	public constructor(
		public checker: Checker,
		public params: PresetCheckerParams,
		public responses: ContractResponse[],
	) {}

	public rewriteIndexing<
		T extends string,
	>(indexing: T) {
		return new PresetChecker<
			_Checker,
			_Info,
			T,
			_Response,
			_NewInput
		>(
			this.checker,
			{
				...this.params,
				indexing,
			},
			this.responses,
		);
	}
}

export function createPresetChecker<
	C extends Checker,
	I extends string,
	K extends string,
	R extends ContractResponse,
	T extends unknown,
>(
	checker: C,
	params: PresetCheckerParams<
		GetCheckerGeneric<C>,
		I,
		K,
		ContractToResponse<R>,
		T
	>,
	responses: R | R[],

) {
	return new PresetChecker<C, I, K, ContractToResponse<R>, T>(
		checker,
		params,
		responses instanceof Array ? responses : [responses],
	);
}

export type GetPresetCheckerGeneric<
	T extends PresetChecker,
> =
	T extends PresetChecker<
		infer Checker,
		infer Info,
		infer Key,
		infer Response,
		infer NewInput
	>
		? {
			checker: Checker;
			info: Info;
			key: Key;
			response: Response;
			newInput: NewInput;
		}
		: never;


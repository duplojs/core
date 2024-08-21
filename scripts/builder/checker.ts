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

export interface CheckerPresetParams<
	CheckerGeneric extends GetCheckerGeneric = GetCheckerGeneric,
	Info extends string = string,
	Key extends string = string,
	CatchResponse extends Response = Response,
> extends
	Pick<
		CheckerStepParams<CheckerGeneric, Info, Key, CatchResponse>,
		"result" | "catch" | "indexing"
	> {
	options?: Partial<CheckerGeneric["options"]>;
}

export class CheckerPreset<
	_Checker extends Checker = Checker,
	_Info extends string = string,
	_Key extends string = string,
	_Response extends Response = Response,
> {
	public constructor(
		public checker: Checker,
		public params: CheckerPresetParams,
		public responses: ContractResponse[],
	) {}
}

export function createCheckerPreset<
	C extends Checker,
	I extends string,
	K extends string,
	R extends ContractResponse,
>(
	checker: C,
	params: CheckerPresetParams<
		GetCheckerGeneric<C>,
		I,
		K,
		ContractToResponse<R>
	>,
	responses: R | R[],

) {
	return new CheckerPreset<C, I, K, ContractToResponse<R>>(
		checker,
		params,
		responses instanceof Array ? responses : [responses],
	);
}

export type GetCheckerPresetGeneric<
	T extends CheckerPreset,
> =
	T extends CheckerPreset<
		infer Checker,
		infer Info,
		infer Key,
		infer Response
	>
		? {
			checker: Checker;
			info: Info;
			key: Key;
			response: Response;
		}
		: never;


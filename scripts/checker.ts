import type { PromiseOrNot } from "@utils/types";
import type { Description } from "./description";

export type GetCheckerGeneric<
	T extends Checker = Checker,
> = T extends Checker<
	infer Options,
	infer Input,
	infer Output
>
	? {
		options: Options;
		input: Input;
		output: Output;
	}
	: never;

export interface CheckerOutput<
	Info extends string = string,
	Data extends unknown = unknown,
> {
	data: Data;
	info: Info;
}

export type CheckerOutputFunction = <
	Info extends string,
	Data extends unknown = undefined,
>(info: Info, data: Data) => CheckerOutput<Info, Data>;

export type CheckerHandler<
	Input extends unknown = unknown,
	Output extends CheckerOutput = CheckerOutput,
> = (input: Input, output: CheckerOutputFunction, options: any) => PromiseOrNot<Output>;

export class Checker<
	_Options extends object = any,
	_Input extends unknown = any,
	_Output extends CheckerOutput = CheckerOutput,
> {
	public options?: object;

	public handler?: CheckerHandler;

	public constructor(
		public name: string,
		public descriptions: Description[] = [],
	) {}

	public setOptions(options: object, descriptions: Description[]) {
		this.options = options;

		this.descriptions.push(...descriptions);
	}

	public setHandler(handlerFunction: CheckerHandler, descriptions: Description[]) {
		this.handler = handlerFunction;

		this.descriptions.push(...descriptions);
	}
}

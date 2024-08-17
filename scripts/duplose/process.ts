import type { CurrentRequestObject } from "@scripts/request";
import { Duplose, type ExtractObject } from ".";
import type { Step } from "@scripts/step";
import type { AnyFunction } from "@utils/types";
import type { ProcessStep } from "@scripts/step/process";
import type { Description } from "@scripts/description";

export type GetProcessGeneric<
	T extends Process = Process,
> = T extends Process<
	infer Request,
	infer Options,
	infer Input,
	infer Drop,
	infer Preflight,
	infer Extract,
	infer Steps,
	infer Floor
>
	? {
		request: Request;
		options: Options;
		input: Input;
		drop: Drop;
		preflight: Preflight;
		extract: Extract;
		steps: Steps;
		floor: Floor;
	}
	: never;

export class Process<
	Request extends CurrentRequestObject = CurrentRequestObject,
	_Options extends object = object,
	_Input extends unknown = unknown,
	_Drop extends string = string,
	_Preflight extends ProcessStep = ProcessStep,
	_Extract extends ExtractObject = ExtractObject,
	_Steps extends Step = Step,
	_Floor extends object = object,
> extends Duplose<
		AnyFunction,
		Request,
		_Preflight,
		_Extract,
		_Steps,
		_Floor
	> {
	public name: string;

	public options?: object;

	public input?: unknown;

	public drop?: string[];

	public constructor(
		name: string,
		descriptions: Description[],
	) {
		super(descriptions);

		this.name = name;
	}

	public setInput(input: unknown) {
		this.input = input;
	}

	public setOptions(options: object) {
		this.options = options;
	}

	public setDrop(drop: string[]) {
		this.drop = drop;
	}

	public build() {

	}
}

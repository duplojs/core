import type { CurrentRequestObject } from "@scripts/request";
import { Response } from "@scripts/response";
import { Duplose, type ExtractObject, type DuploseBuildedFunctionContext, type AcceleratedExtractObject } from ".";
import type { Step } from "@scripts/step";
import type { Description } from "@scripts/description";
import { BuildNoRegisteredDuploseError } from "@scripts/error/buildNoRegisteredDuplose";
import { advancedEval } from "@utils/advancedEval";
import { extractPart, insertBlock, mapped, StringBuilder } from "@utils/stringBuilder";
import { simpleClone } from "@utils/simpleClone";
import { makeFloor } from "@scripts/floor";
import type { PreflightStep } from "@scripts/step/preflight";
import { ContractResponseError } from "@scripts/error/contractResponseError";
import type { PromiseOrNot } from "@utils/types";

export interface ProcessBuildedFunction<
	O extends object | undefined = object | undefined,
	I extends unknown = unknown,
> {
	(
		request: CurrentRequestObject,
		options?: O,
		input?: I
	): PromiseOrNot<unknown>;
	context: DuploseBuildedFunctionContext<Process>;
}

export type GetProcessGeneric<
	T extends Process = Process,
> = T extends Process<
	infer Request,
	infer Options,
	infer Input,
	infer Drop,
	infer PreflightStep,
	infer Extract,
	infer Steps,
	infer Floor
>
	? {
		request: Request;
		options: Options;
		input: Input;
		drop: Drop;
		preflightStep: PreflightStep;
		extract: Extract;
		steps: Steps;
		floor: Floor;
	}
	: never;

export class Process<
	Request extends CurrentRequestObject = any,
	_Options extends object | undefined = any,
	_Input extends unknown = any,
	_Drop extends string = any,
	_PreflightStep extends PreflightStep = any,
	_Extract extends ExtractObject = any,
	_Step extends Step = any,
	_FloorData extends object = any,
> extends Duplose<
		ProcessBuildedFunction<_Options, _Input>,
		Request,
		_PreflightStep,
		_Extract,
		_Step,
		_FloorData
	> {
	public name: string;

	public options?: object;

	public input?: unknown;

	public drop?: string[];

	public constructor(
		name: string,
		descriptions: Description[] = [],
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

	public setDrop(
		drop: string[],
		descriptions: Description[] = [],
	) {
		this.drop = drop;
		this.descriptions.push(...descriptions);
	}

	public build(): ProcessBuildedFunction<_Options, _Input> {
		if (!this.instance) {
			throw new BuildNoRegisteredDuploseError(this);
		}

		const buildedPreflight = this.preflightSteps.map(
			(step) => step.build(this.instance!),
		);

		let extract: ExtractObject | AcceleratedExtractObject | undefined = simpleClone(this.extract);

		if (!this.instance.config.disabledZodAccelerator) {
			extract = this.acceleratedExtract();
		}

		const buildedStep = this.steps.map(
			(step) => step.build(this.instance!),
		);

		const drop = mapped(
			this.drop ?? [],
			(key) => /* js */`"${key}": floor.pickup("${key}"),`,
		);

		let content = /* js */`
		let ${StringBuilder.floor} = this.makeFloor();
		let ${StringBuilder.result} = undefined;
		floor.drop("options", ${StringBuilder.options});
		floor.drop("input", ${StringBuilder.input});
		${StringBuilder.label}: {
			${insertBlock("preflight-before")}

			${mapped(buildedPreflight, (value, index) => value.toString(index))}

			${insertBlock("preflight-after")}
			
			${extractPart(this.extract)}

			${insertBlock("steps-before")}

			${mapped(buildedStep, (value, index) => value.toString(index))}

			${insertBlock("steps-after")}
		}

		${insertBlock("process-if-return-before")}
		if(${StringBuilder.result} instanceof this.Response){
			${insertBlock("process-result-return-before")}
			return result;
		}
		else {
			${insertBlock("process-drop-return-before")}
			return {
				${drop}
			};
		}
		`;

		content = this.applyEditingFunctions(content);

		const context: DuploseBuildedFunctionContext<Process> = {
			makeFloor,
			Response,
			extract,
			extractError: this.extractError ?? this.instance.extractError,
			preflightSteps: buildedPreflight,
			steps: buildedStep,
			extensions: simpleClone(this.extensions),
			ContractResponseError,
			duplose: this,
			duplo: this.instance,
		};

		const buildedFunction = advancedEval<ProcessBuildedFunction>({
			args: [StringBuilder.request, StringBuilder.options, StringBuilder.input],
			content,
			bind: context,
		});

		buildedFunction.context = context;

		return buildedFunction;
	}
}

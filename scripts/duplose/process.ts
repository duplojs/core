import type { CurrentRequestObject } from "@scripts/request";
import { Response } from "@scripts/response";
import { Duplose, type ExtractObject, type DuploseBuildedFunctionContext } from ".";
import type { Step } from "@scripts/step";
import type { Description } from "@scripts/description";
import { BuildNoRegisteredDuploseError } from "@scripts/error/buildNoRegisteredDuplose";
import { advancedEval } from "@utils/advancedEval";
import { extractPart, insertBlock, mapped, StringBuilder } from "@utils/stringBuilder";
import { simpleClone } from "@utils/simpleClone";
import { makeFloor } from "@scripts/floor";
import type { PreflightStep } from "@scripts/step/preflight";
import { ContractResponseError } from "@scripts/error/contractResponseError";

export type ProcessBuildedFunction = (
	request: CurrentRequestObject,
	options?: object,
	input?: unknown
) => Promise<void>;

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
		ProcessBuildedFunction,
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

	public build() {
		if (!this.instance) {
			throw new BuildNoRegisteredDuploseError(this);
		}

		const buildedPreflight = this.preflightSteps.map(
			(step) => step.build(),
		);

		const buildedStep = this.steps.map(
			(step) => step.build(),
		);

		const drop = mapped(
			this.drop ?? [],
			(key) => /* js */`"${key}": floor.pickup("${key}"),`,
		);

		const content = /* js */`
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
		if(${StringBuilder.result} instanceof this.Response){
			return result;
		}
		else {
			return {
				${drop}
			};
		}
		`;

		return advancedEval<ProcessBuildedFunction>({
			args: [StringBuilder.request, StringBuilder.options, StringBuilder.input],
			content,
			bind: {
				makeFloor,
				Response,
				extract: simpleClone(this.extract),
				extractError: this.extractError ?? this.instance.extractError,
				preflightSteps: buildedPreflight,
				steps: buildedStep,
				extensions: simpleClone(this.extensions),
				ContractResponseError,
			} satisfies DuploseBuildedFunctionContext,
		});
	}
}

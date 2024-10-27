import type { CurrentRequestObject } from "@scripts/request";
import { Response } from "@scripts/response";
import { Duplose, type DuploseBuildedFunctionContext, type DuploseDefinition } from ".";
import { BuildNoRegisteredDuploseError } from "@scripts/error/buildNoRegisteredDuplose";
import { insertBlock, mapped, StringBuilder } from "@utils/stringBuilder";
import { simpleClone } from "@utils/simpleClone";
import { makeFloor } from "@scripts/floor";
import { ContractResponseError } from "@scripts/error/contractResponseError";
import type { PromiseOrNot } from "@utils/types";

export interface ProcessBuildedFunction<
	GenericProcess extends Process<any, any, any> = Process<any, any, any>,
> {
	(
		request: CurrentRequestObject,
		options: GenericProcess["definiton"]["options"],
		input: GenericProcess["definiton"]["input"]
	): PromiseOrNot<unknown>;
	context: DuploseBuildedFunctionContext<GenericProcess>;
}

export type GetProcessGeneric<
	T extends PresetGenericProcess = PresetGenericProcess,
> = T extends Process<
	infer InferedProcessDefinition,
	infer inferedRequest,
	infer inferedFloorData
>
	? {
		options: InferedProcessDefinition["options"];
		input: InferedProcessDefinition["input"];
		drop: InferedProcessDefinition["drop"];
		preflightStep: InferedProcessDefinition["preflightSteps"];
		steps: InferedProcessDefinition["steps"];
		request: inferedRequest;
		floor: inferedFloorData;
	}
	: never;

interface ProcessDefinition extends DuploseDefinition {
	name: string;
	options?: object;
	input?: unknown;
	drop: string[];
}

export type PresetGenericProcess = Process<ProcessDefinition, CurrentRequestObject, object>;

export class Process<
	GenericProcessDefinition extends ProcessDefinition,
	_GenericRequest extends CurrentRequestObject,
	_GenericFloorData extends object,
> extends Duplose<
		GenericProcessDefinition,
		_GenericRequest,
		_GenericFloorData
	> {
	public constructor(
		definiton: GenericProcessDefinition,
	) {
		super(definiton);
	}

	public async build() {
		if (!this.instance) {
			throw new BuildNoRegisteredDuploseError(this);
		}

		const buildedPreflight = await Promise.all(
			this.definiton.preflightSteps.map(
				(step) => step.build(this.instance!),
			),
		);

		const buildedStep = await Promise.all(
			this.definiton.steps.map(
				(step) => step.build(this.instance!),
			),
		);

		const drop = mapped(
			this.definiton.drop ?? [],
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

		const context: DuploseBuildedFunctionContext<this> = {
			makeFloor,
			Response,
			preflightSteps: buildedPreflight,
			steps: buildedStep,
			extensions: simpleClone(this.extensions),
			ContractResponseError,
			duplose: this,
			duplo: this.instance,
		};

		const evaler = this.evaler ?? this.instance.evalers.duplose ?? Duplose.defaultEvaler;

		const buildedFunction = await evaler.makeFunction<
			ProcessBuildedFunction<this>
		>({
			duplose: this,
			args: [StringBuilder.request, StringBuilder.options, StringBuilder.input],
			content,
			bind: context,
		});

		buildedFunction.context = context;

		return buildedFunction;
	}
}

import type { CurrentRequestObject } from "@scripts/request";
import { type PresetGenericResponse, Response } from "@scripts/response";
import { Duplose, type DuploseBuildedFunctionContext, type DuploseDefinition } from ".";
import { BuildNoRegisteredDuploseError } from "@scripts/error/buildNoRegisteredDuplose";
import { insertBlock, mapped, StringBuilder } from "@utils/stringBuilder";
import { makeFloor } from "@scripts/floor";
import { ContractResponseError } from "@scripts/error/contractResponseError";
import { type PreflightStep } from "@scripts/step/preflight";
import { createInterpolation, simpleClone, type MybePromise } from "@duplojs/utils";

export interface ProcessBuildedFunction<
	GenericProcess extends Process<any, any, any> = Process<any, any, any>,
> {
	(
		request: CurrentRequestObject,
		options: undefined | object,
		input: unknown
	): MybePromise<object | PresetGenericResponse>;
	context: DuploseBuildedFunctionContext<GenericProcess>;
}

export type GetProcessGeneric<
	T extends Process = Process,
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

export interface ProcessDefinition extends DuploseDefinition {
	preflightSteps: PreflightStep[];
	name: string;
	options?: object;
	input?: unknown;
	drop: string[];
}

export class Process<
	GenericProcessDefinition extends ProcessDefinition = ProcessDefinition,
	_GenericRequest extends CurrentRequestObject = any,
	_GenericFloorData extends object = any,
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

	public override getAllHooks() {
		const hooks = super.getAllHooks();

		this.definiton.preflightSteps.forEach((step) => {
			hooks.import(step.parent.getAllHooks());
		});

		return hooks;
	}

	public override hasDuplose(duplose: Duplose<any, any, any>, deep = Infinity) {
		if (super.hasDuplose(duplose, deep)) {
			return true;
		}

		for (const preflight of this.definiton.preflightSteps) {
			if (preflight.parent.hasDuplose(duplose, deep - 1)) {
				return true;
			}
		}

		return false;
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
			${insertBlock(Process.insertBlockName.beforePreflightSteps())}

			${mapped(buildedPreflight, (value, index) => value.toString(index))}

			${insertBlock(Process.insertBlockName.afterPreflightSteps())}

			${insertBlock(Process.insertBlockName.beforeSteps())}

			${mapped(buildedStep, (value, index) => value.toString(index))}

			${insertBlock(Process.insertBlockName.afterSteps())}
		}

		${insertBlock(Process.insertBlockName.beforeTreatResult())}

		if(${StringBuilder.result} instanceof this.Response){
			${insertBlock(Process.insertBlockName.beforeReturnResponse())}

			return result;
		}
		else {
			${insertBlock(Process.insertBlockName.beforeReturnValues())}
			
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

	public static insertBlockName = {
		beforePreflightSteps: createInterpolation("beforePreflightSteps"),
		afterPreflightSteps: createInterpolation("afterPreflightSteps"),

		beforeSteps: createInterpolation("beforeSteps"),
		afterSteps: createInterpolation("afterSteps"),

		beforeTreatResult: createInterpolation("beforeTreatResult"),

		beforeReturnResponse: createInterpolation("beforeReturnResponse"),
		beforeReturnValues: createInterpolation("beforeReturnValues"),
	};
}

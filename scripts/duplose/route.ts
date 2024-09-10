import type { CurrentRequestObject, HttpMethod } from "@scripts/request";
import { Response } from "@scripts/response";
import { Duplose, type ExtractObject, type DuploseBuildedFunctionContext, type AcceleratedExtractObject } from ".";
import type { Step } from "@scripts/step";
import type { Description } from "@scripts/description";
import { advancedEval } from "@utils/advancedEval";
import { checkResult, condition, extractPart, insertBlock, mapped, StringBuilder } from "@utils/stringBuilder";
import { makeFloor } from "@scripts/floor";
import { BuildNoRegisteredDuploseError } from "@scripts/error/buildNoRegisteredDuplose";
import { simpleClone } from "@utils/simpleClone";
import { HandlerStep } from "@scripts/step/handler";
import { LastStepMustBeHandlerError } from "@scripts/error/lastStepMustBeHandlerError";
import type { PreflightStep } from "@scripts/step/preflight";
import { ContractResponseError } from "@scripts/error/contractResponseError";
import { ResultIsNotAResponse } from "@scripts/error/resultIsNotAResponse";
import { type BuildedHooksRouteLifeCycle } from "@scripts/hook/routeLifeCycle";

export interface RouteBuildedFunctionContext extends DuploseBuildedFunctionContext<Route> {
	hooks: BuildedHooksRouteLifeCycle;
	ResultIsNotAResponse: typeof ResultIsNotAResponse;
}

export interface RouteBuildedFunction {
	(request: CurrentRequestObject): Promise<Response>;
	context: RouteBuildedFunctionContext;
}

export type GetRouteGeneric<
	T extends Route = Route,
> = T extends Route<
	infer Request,
	infer PreflightSteps,
	infer Extract,
	infer Step,
	infer Floor
>
	? {
		request: Request;
		preflightSteps: PreflightSteps;
		extract: Extract;
		step: Step;
		floor: Floor;
	}
	: never;

export class Route<
	Request extends CurrentRequestObject = any,
	_PreflightStep extends PreflightStep = any,
	_Extract extends ExtractObject = any,
	_Step extends Step = any,
	_FloorData extends object = any,
> extends Duplose<
		RouteBuildedFunction,
		Request,
		_PreflightStep,
		_Extract,
		_Step,
		_FloorData
	> {
	public method: HttpMethod;

	public paths: string[];

	public constructor(
		method: HttpMethod,
		paths: string[],
		descriptions: Description[] = [],
	) {
		super(descriptions);
		this.method = method;
		this.paths = paths;
	}

	public build() {
		if (!this.instance) {
			throw new BuildNoRegisteredDuploseError(this);
		}

		if (!(this.steps.at(-1) instanceof HandlerStep)) {
			throw new LastStepMustBeHandlerError(this);
		}

		const hooks = this.getAllHooks();
		hooks.import(this.instance.hooksRouteLifeCycle);

		const buildedPreflight = this.preflightSteps.map(
			(step) => step.build(this.instance!),
		);

		let extract: ExtractObject | AcceleratedExtractObject | undefined = simpleClone(this.extract);

		if (!this.instance.config.disabledZodAccelerator) {
			extract = this.acceleratedExtract();
		}

		const bodyTreat = condition(
			!!this.extract?.body,
			() => /* js */`
			if(request.body === undefined){
				${insertBlock("hook-parsingBody-before")}

				${StringBuilder.result} = await this.hooks.parsingBody(${StringBuilder.request});

				${insertBlock("hook-parsingBody-before-check-result")}

				${checkResult()}

				${insertBlock("hook-parsingBody-after")}
			}
			`,
		);

		const buildedStep = this.steps.map(
			(step) => step.build(this.instance!),
		);

		const content = /* js */`
		let ${StringBuilder.result} = undefined;

		try {
			let ${StringBuilder.floor} = this.makeFloor();

			${StringBuilder.label}: {
				${insertBlock("hook-beforeRouteExecution-before")}

				${StringBuilder.result} = await this.hooks.beforeRouteExecution(${StringBuilder.request})
				
				${insertBlock("hook-beforeRouteExecution-before-check-result")}

				${checkResult()}

				${insertBlock("hook-beforeRouteExecution-after")}

				${insertBlock("preflight-before")}

				${mapped(buildedPreflight, (value, index) => value.toString(index))}

				${insertBlock("preflight-after")}

				${bodyTreat}

				${extractPart(this.extract)}

				${insertBlock("steps-before")}

				${mapped(buildedStep, (value, index) => value.toString(index))}

				${insertBlock("steps-after")}

				${insertBlock("defaultResponse-before")}

				${StringBuilder.result} = new this.Response(503, "NO_RESPONSE_SENT", undefined);
			}
		} catch (error) {
			${insertBlock("hook-onError-before")}

			${StringBuilder.result} = await this.hooks.onError(${StringBuilder.request}, error) 

			${insertBlock("hook-onError-after")}
		}

		${insertBlock("check-result-before")}

		if(!(${StringBuilder.result} instanceof this.Response)){
			throw new this.ResultIsNotAResponse(${StringBuilder.result})
		}

		${insertBlock("check-result-after")}

		return ${StringBuilder.result}
		`;

		const context: RouteBuildedFunctionContext = {
			hooks: {
				beforeRouteExecution: hooks.beforeRouteExecution.build(),
				parsingBody: hooks.parsingBody.build(),
				beforeSend: hooks.beforeSend.build(),
				serializeBody: hooks.serializeBody.build(),
				afterSend: hooks.afterSend.build(),
				onError: hooks.onError.build(),
			},
			makeFloor,
			Response,
			extract,
			extractError: this.extractError ?? this.instance.extractError,
			preflightSteps: buildedPreflight,
			steps: buildedStep,
			extensions: simpleClone(this.extensions),
			ContractResponseError,
			ResultIsNotAResponse,
			duplose: this,
			duplo: this.instance,
		};

		const buildedFunction = advancedEval<RouteBuildedFunction>({
			forceAsync: true,
			args: [StringBuilder.request],
			content,
			bind: context,
		});

		buildedFunction.context = context;

		return buildedFunction;
	}
}

import type { CurrentRequestObject } from "@scripts/request";
import { type PresetGenericResponse, Response } from "@scripts/response";
import { type DuploseDefinition, type DuploseBuildedFunctionContext, Duplose } from ".";
import { checkResult, condition, insertBlock, mapped, StringBuilder } from "@utils/stringBuilder";
import { makeFloor } from "@scripts/floor";
import { BuildNoRegisteredDuploseError } from "@scripts/error/buildNoRegisteredDuplose";
import { simpleClone } from "@utils/simpleClone";
import { HandlerStep } from "@scripts/step/handler";
import { LastStepMustBeHandlerError } from "@scripts/error/lastStepMustBeHandlerError";
import { ContractResponseError } from "@scripts/error/contractResponseError";
import { ResultIsNotAResponseError } from "@scripts/error/resultIsNotAResponseError";
import { type BuildedHooksRouteLifeCycle } from "@scripts/hook/routeLifeCycle";
import { hookRouteContractResponseError, hookRouteError, hookRouteRangeError } from "@scripts/hook/default";
import type { GetPropsWithTrueValue } from "@utils/getPropsWithTrueValue";
import { type PreflightStep } from "@scripts/step/preflight";

export interface HttpMethods {
	DELETE: true;
	GET: true;
	HEAD: true;
	OPTIONS: true;
	PATCH: true;
	POST: true;
	PUT: true;
}

export type HttpMethod = GetPropsWithTrueValue<HttpMethods>;

export interface RouteBuildedFunctionContext extends DuploseBuildedFunctionContext<Route> {
	hooks: BuildedHooksRouteLifeCycle<any>;
	ResultIsNotAResponseError: typeof ResultIsNotAResponseError;
}

export interface RouteBuildedFunction {
	(request: CurrentRequestObject): Promise<PresetGenericResponse>;
	context: RouteBuildedFunctionContext;
}

export type GetRouteGeneric<
	T extends Route = Route,
> = T extends Route<
	infer InferedRouteDefinition,
	infer inferedRequest,
	infer inferedFloorData
>
	? {
		preflightSteps: InferedRouteDefinition["preflightSteps"];
		step: InferedRouteDefinition["steps"];
		request: inferedRequest;
		floor: inferedFloorData;
	}
	: never;

export interface RouteDefinition extends DuploseDefinition {
	preflightSteps: PreflightStep[];
	method: HttpMethod;
	paths: string[];
}

export class Route<
	GenericRouteDefinition extends RouteDefinition = RouteDefinition,
	GenericRequest extends CurrentRequestObject = any,
	GenericFloorData extends object = any,
> extends Duplose<
		GenericRouteDefinition,
		GenericRequest,
		GenericFloorData
	> {
	public constructor(
		definiton: GenericRouteDefinition,
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

		if (!(this.definiton.steps.at(-1) instanceof HandlerStep)) {
			throw new LastStepMustBeHandlerError(this);
		}

		const hooks = this.getAllHooks();
		hooks.import(this.instance.hooksRouteLifeCycle);

		hooks.onError.addSubscriber(hookRouteContractResponseError);
		hooks.onError.addSubscriber(hookRouteRangeError);
		hooks.onError.addSubscriber(hookRouteError);

		const buildedPreflight = await Promise.all(
			this.definiton.preflightSteps.map(
				(step) => step.build(this.instance!),
			),
		);

		const bodyTreat = condition(
			Route.methodsWithBody.includes(
				this.definiton.method,
			),
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

		const buildedStep = await Promise.all(
			this.definiton.steps.map(
				(step) => step.build(this.instance!),
			),
		);

		let content = /* js */`
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
			throw new this.ResultIsNotAResponseError(${StringBuilder.result})
		}

		${insertBlock("check-result-after")}

		return ${StringBuilder.result}
		`;

		content = this.applyEditingFunctions(content);

		const context: RouteBuildedFunctionContext = {
			hooks: {
				beforeRouteExecution: await hooks.beforeRouteExecution.build(),
				parsingBody: await hooks.parsingBody.build(),
				beforeSend: await hooks.beforeSend.build(),
				serializeBody: await hooks.serializeBody.build(),
				afterSend: await hooks.afterSend.build(),
				onError: await hooks.onError.build(),
			},
			makeFloor,
			Response,
			preflightSteps: buildedPreflight,
			steps: buildedStep,
			extensions: simpleClone(this.extensions),
			ContractResponseError,
			ResultIsNotAResponseError,
			duplose: this,
			duplo: this.instance,
		};

		const evaler = this.evaler ?? this.instance.evalers.duplose ?? Duplose.defaultEvaler;

		const buildedFunction = await evaler.makeFunction<RouteBuildedFunction>({
			duplose: this,
			forceAsync: true,
			args: [StringBuilder.request],
			content,
			bind: context,
		});

		buildedFunction.context = context;

		return buildedFunction;
	}

	public static methodsWithBody: HttpMethod[] = ["POST", "PUT", "PATCH"];
}

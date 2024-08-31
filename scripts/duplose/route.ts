import type { CurrentRequestObject, HttpMethod } from "@scripts/request";
import { Response } from "@scripts/response";
import { Duplose, type ExtractObject, type DuploseBuildedFunctionContext } from ".";
import type { Step } from "@scripts/step";
import type { Description } from "@scripts/description";
import { advancedEval } from "@utils/advancedEval";
import { checkResult, condition, extractPart, insertBlock, mapped, StringBuilder } from "@utils/stringBuilder";
import { copyHooks, makeHooksRouteLifeCycle, type BuildedHooksRouteLifeCycle } from "@scripts/hook";
import { makeFloor } from "@scripts/floor";
import { BuildNoRegisteredDuploseError } from "@scripts/error/buildNoRegisteredDuplose";
import { simpleClone } from "@utils/simpleClone";
import { HandlerStep } from "@scripts/step/handler";
import { LastStepMustBeHandlerError } from "@scripts/error/lastStepMustBeHandlerError";
import type { PreflightStep } from "@scripts/step/preflight";
import { ContractResponseError } from "@scripts/error/contractResponseError";

export interface RouteBuildedFunctionContext extends DuploseBuildedFunctionContext {
	hooks: BuildedHooksRouteLifeCycle;
}

export type RouteBuildedFunction = (request: CurrentRequestObject) => Promise<void>;

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

		const hooks = makeHooksRouteLifeCycle<Request>();

		this.copyHooks(hooks);
		copyHooks(hooks, this.instance.hooksRouteLifeCycle);

		const buildedPreflight = this.preflightSteps.map(
			(step) => step.build(),
		);

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
			(step) => step.build(),
		);

		const content = /* js */`
		let ${StringBuilder.floor} = this.makeFloor();
		let ${StringBuilder.result} = undefined;

		try {
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

			${StringBuilder.result} = await this.hooks.onError(${StringBuilder.request}, error) ?? new this.Response(500, "SERVER_ERROR", undefined);

			${insertBlock("hook-onError-after")}
		}

		${insertBlock("hook-beforeSend-before")}

		await this.hooks.beforeSend(${StringBuilder.request}, ${StringBuilder.result})

		${insertBlock("hook-beforeSend-after")}
		${insertBlock("hook-serializeBody-before")}

		await this.hooks.serializeBody(${StringBuilder.request}, ${StringBuilder.result})

		${insertBlock("hook-serializeBody-after")}
		${insertBlock("hook-afterSend-before")}

		await this.hooks.afterSend(${StringBuilder.request}, ${StringBuilder.result})

		${insertBlock("hook-afterSend-after")}
		`;

		return advancedEval<RouteBuildedFunction>({
			forceAsync: true,
			args: [StringBuilder.request],
			content,
			bind: {
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
				extract: simpleClone(this.extract),
				extractError: this.extractError ?? this.instance.extractError,
				preflightSteps: buildedPreflight,
				steps: buildedStep,
				extensions: simpleClone(this.extensions),
				ContractResponseError,
			} satisfies RouteBuildedFunctionContext,
		});
	}
}

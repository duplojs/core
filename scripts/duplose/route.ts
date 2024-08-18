import type { CurrentRequestObject, HttpMethod } from "@scripts/request";
import { Response } from "@scripts/response";
import { Duplose, type ExtractObject, type DuploseBuildedFunctionContext } from ".";
import type { Step } from "@scripts/step";
import type { Description } from "@scripts/description";
import type { ProcessStep } from "@scripts/step/process";
import { advancedEval } from "@utils/advancedEval";
import { checkResult, condition, extractPart, insertBlock, mapped, StringBuilder } from "@utils/stringBuilder";
import { copyHooks, makeHooksRouteLifeCycle, type BuildedHooksRouteLifeCycle } from "@scripts/hook";
import { makeFloor } from "@scripts/floor";
import { BuildNoRegisteredDuploseError } from "@scripts/error/buildNoRegisteredDuplose";
import { simpleClone } from "@utils/simpleClone";
import { HandlerStep } from "@scripts/step/handler";
import { LastStepMustBeHandlerError } from "@scripts/error/lastStepMustBeHandlerError";

interface RouteBuildedFunctionContext extends DuploseBuildedFunctionContext {
	hooks: BuildedHooksRouteLifeCycle;
}

type RouteBuildedFunction = (this: RouteBuildedFunctionContext, request: CurrentRequestObject) => Promise<void>;

export type GetRouteGeneric<
	T extends Route = Route,
> = T extends Route<
	infer Request,
	infer Preflight,
	infer Extract,
	infer Steps,
	infer Floor
>
	? {
		request: Request;
		preflight: Preflight;
		extract: Extract;
		steps: Steps;
		floor: Floor;
	}
	: never;

export class Route<
	Request extends CurrentRequestObject = CurrentRequestObject,
	_Preflight extends ProcessStep = ProcessStep,
	_Extract extends ExtractObject = ExtractObject,
	_Steps extends Step = Step,
	_Floor extends object = object,
> extends Duplose<
		RouteBuildedFunction,
		Request,
		_Preflight,
		_Extract,
		_Steps,
		_Floor
	> {
	public method: HttpMethod;

	public paths: string[];

	public constructor(
		method: HttpMethod,
		paths: string[],
		descriptions: Description[],
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

		const buildedPreflight = this.preflight.map(
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

				${StringBuilder.result} = ${condition(!!hooks.onError.subscribers.length, () => `await this.hooks.beforeRouteExecution(${StringBuilder.request})`)}}
				
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
				${StringBuilder.result} = new this.Response(503, "NO_RESPONSE_SENT", undefined)
			}

			${insertBlock("hook-beforeSend-before")}

			${condition(!!hooks.onError.subscribers.length, () => `await this.hooks.beforeSend(${StringBuilder.request}, ${StringBuilder.result})`)}

			${insertBlock("hook-beforeSend-after")}
			${insertBlock("hook-serializeBody-before")}

			${condition(!!hooks.onError.subscribers.length, () => `await this.hooks.serializeBody(${StringBuilder.request}, ${StringBuilder.result})`)}

			${insertBlock("hook-serializeBody-after")}
			${insertBlock("hook-afterSend-before")}

			${condition(!!hooks.onError.subscribers.length, () => `await this.hooks.afterSend(${StringBuilder.request}, ${StringBuilder.result})`)}

			${insertBlock("hook-afterSend-after")}
		} catch (error) {
			${insertBlock("hook-onError-before")}

			${condition(!!hooks.onError.subscribers.length, () => `await this.hooks.onError(${StringBuilder.request}, error)`)}

			${insertBlock("hook-onError-after")}
		}
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
				preflight: buildedPreflight,
				steps: buildedStep,
				extensions: simpleClone(this.extensions),
			} satisfies RouteBuildedFunctionContext,
		});
	}
}

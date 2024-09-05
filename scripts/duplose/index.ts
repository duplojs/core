import type { Response } from "@scripts/response";
import type { Description } from "@scripts/description";
import type { CurrentRequestObject } from "@scripts/request";
import type { Step } from "@scripts/step";
import type { AnyFunction } from "@utils/types";
import type { ZodError, ZodType } from "zod";
import { ProcessStep } from "@scripts/step/process";
import type { Duplo } from "@scripts/duplo";
import type { makeFloor } from "@scripts/floor";
import type { BuildedStep } from "@scripts/step/builded";
import type { PreflightStep } from "@scripts/step/preflight";
import type { BuildedPreflightStep } from "@scripts/step/builded/preflight";
import type { GetPropsWithTrueValue } from "@utils/getPropsWithTrueValue";
import type { ContractResponseError } from "@scripts/error/contractResponseError";
import { type BuildedHooksRouteLifeCycle, HooksRouteLifeCycle } from "@scripts/hook/routeLifeCycle";

export interface DuploseBuildedFunctionContext<
	T extends Duplose = Duplose,
> {
	makeFloor: typeof makeFloor;
	Response: typeof Response;
	extract?: ExtractObject;
	extractError: ExtractErrorFunction;
	preflightSteps: BuildedPreflightStep[];
	steps: BuildedStep[];
	extensions: object;
	ContractResponseError: typeof ContractResponseError;
	duplose: T;
	duplo: Duplo;
}

export type ExtractErrorFunction = (
	type: keyof ExtractObject,
	key: string,
	error: ZodError
) => Response;

export interface DisabledExtractKey {
	method: true;
}

export type ExtractKey<
	T extends object = CurrentRequestObject,
> = Exclude<
	keyof T,
	GetPropsWithTrueValue<DisabledExtractKey>
>;

export type ExtractObject<
	T extends object = CurrentRequestObject,
> = {
	[P in ExtractKey<T>]?: Record<string, ZodType> | ZodType;
};

export type DefineHooksRouteLifeCycle<
	Request extends CurrentRequestObject = any,
	ReturnType extends unknown = undefined,
> = <
	T extends keyof BuildedHooksRouteLifeCycle<Request>,
>(hookName: T, subscriber: BuildedHooksRouteLifeCycle<Request>[T]) => ReturnType;

export abstract class Duplose<
	BuildedFunction extends AnyFunction = any,
	Request extends CurrentRequestObject = any,
	_PreflightStep extends PreflightStep = any,
	_Extract extends ExtractObject = any,
	_Step extends Step = any,
	_FloorData extends object = any,
> {
	public instance?: Duplo;

	public hooks = new HooksRouteLifeCycle<Request>();

	public preflightSteps: PreflightStep[] = [];

	public extract?: ExtractObject;

	public extractError?: ExtractErrorFunction;

	public steps: Step[] = [];

	public modifiers: AnyFunction[] = [];

	public extensions: object = {};

	public descriptions: Description[] = [];

	public constructor(descriptions: Description[] = []) {
		this.descriptions.push(...descriptions);
	}

	public setExtract(
		extract: ExtractObject,
		extractError?: ExtractErrorFunction,
		descriptions: Description[] = [],
	) {
		this.extract = extract;
		this.extractError = extractError;

		this.descriptions.push(...descriptions);
	}

	public addPreflightSteps(...preflightSteps: PreflightStep[]) {
		this.preflightSteps.push(...preflightSteps);
	}

	public addStep(...steps: Step[]) {
		this.steps.push(...steps);
	}

	public getAllHooks() {
		const hooks = new HooksRouteLifeCycle();

		hooks.import(this.hooks);

		this.steps
			.filter((step): step is ProcessStep => step instanceof ProcessStep)
			.forEach((step) => void hooks.import(step.parent.getAllHooks()));

		this.preflightSteps.forEach((step) => {
			hooks.import(step.parent.getAllHooks());
		});

		return hooks;
	}

	public abstract build(): BuildedFunction;
}

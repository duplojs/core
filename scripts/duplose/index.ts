import type { Response } from "@scripts/response";
import type { Description } from "@scripts/description";
import { copyHooks, makeHooksRouteLifeCycle, type HooksRouteLifeCycle } from "@scripts/hook";
import type { CurrentRequestObject } from "@scripts/request";
import type { Step } from "@scripts/step";
import type { AnyFunction } from "@utils/types";
import type { ZodError, ZodType } from "zod";
import { ProcessStep } from "@scripts/step/process";
import type { Duplo } from "@scripts/duplo";
import type { makeFloor } from "@scripts/floor";
import type { BuildedStep } from "@scripts/step/builded";
import type { BuildedProcessStep } from "@scripts/step/builded/process";

export interface DuploseBuildedFunctionContext {
	makeFloor: typeof makeFloor;
	Response: typeof Response;
	extract?: ExtractObject;
	extractError: ExtractErrorFunction;
	preflight: BuildedProcessStep[];
	steps: BuildedStep[];
	extensions: object;
}

export type ExtractErrorFunction = (
	type: keyof ExtractObject,
	key: string,
	error: ZodError
) => Response;

export interface ExtractObject {
	body?: Record<string, ZodType> | ZodType;
	headers?: Record<string, ZodType> | ZodType;
	params?: Record<string, ZodType> | ZodType;
	query?: Record<string, ZodType> | ZodType;
}

export abstract class Duplose<
	BuildedFunction extends AnyFunction = any,
	Request extends CurrentRequestObject = any,
	_Preflight extends ProcessStep = any,
	_Extract extends ExtractObject = any,
	_Steps extends Step = any,
	_Floor extends object = any,
> {
	public instance?: Duplo;

	public hooks = makeHooksRouteLifeCycle<Request>();

	public preflight: ProcessStep[] = [];

	public extract?: ExtractObject;

	public extractError?: ExtractErrorFunction;

	public steps: Step[] = [];

	public modifiers: AnyFunction[] = [];

	public extensions: object = {};

	public descriptions: Description[] = [];

	public constructor(descriptions: Description[]) {
		this.descriptions.push(...descriptions);
	}

	public setExtract(
		extract: ExtractObject,
		extractError: ExtractErrorFunction | undefined,
		descriptions: Description[],
	) {
		this.extract = extract;
		this.extractError = extractError;
		this.descriptions.push(...descriptions);
	}

	public addPreflight(preflight: ProcessStep) {
		this.preflight.push(preflight);
	}

	public addStep(step: Step) {
		this.steps.push(step);
	}

	public copyHooks(base: HooksRouteLifeCycle<any>) {
		copyHooks(base, this.hooks);

		this.steps.forEach((step) => {
			if (step instanceof ProcessStep) {
				step.parent.copyHooks(base);
			}
		});

		this.preflight.forEach((step) => {
			if (step instanceof ProcessStep) {
				step.parent.copyHooks(base);
			}
		});
	}

	public abstract build(): BuildedFunction;
}

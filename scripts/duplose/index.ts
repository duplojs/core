import type { Response } from "@scripts/response";
import type { Description } from "@scripts/description";
import { makeHooksRouteLifeCycle } from "@scripts/hook";
import type { CurrentRequestObject } from "@scripts/request";
import type { Step } from "@scripts/step";
import type { AnyFunction } from "@utils/types";
import type { ZodError, ZodType } from "zod";

export type ErrorExtractFunction = (
	type: keyof ExtractObject,
	index: string,
	error: ZodError
) => Response;

export interface ExtractObject {
	body?: Record<string, ZodType> | ZodType;
	headers?: Record<string, ZodType> | ZodType;
	params?: Record<string, ZodType> | ZodType;
	query?: Record<string, ZodType> | ZodType;
}

export abstract class Duplose<
	Request extends CurrentRequestObject = CurrentRequestObject,
	_Extract extends ExtractObject = ExtractObject,
	_Steps extends Step[] = [],
	_Floor extends object = object,
> {
	public hooks = makeHooksRouteLifeCycle<Request>();

	public extract?: ExtractObject;

	public errorExtract?: ErrorExtractFunction;

	public steps: Step[] = [];

	public modifiers: AnyFunction[] = [];

	public extensions: object = {};

	public descriptions: Description[] = [];

	public constructor(descriptions: Description[]) {
		this.descriptions.push(...descriptions);
	}

	public setExtract(
		extract: ExtractObject,
		errorExtract: ErrorExtractFunction | undefined,
		descriptions: Description[],
	) {
		this.extract = extract;
		this.errorExtract = errorExtract;
		this.descriptions.push(...descriptions);
	}

	public addStep(step: Step) {
		this.steps.push(step);
	}

	public abstract toString(): string;
}

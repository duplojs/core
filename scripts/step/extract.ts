import type { Description } from "@scripts/description";
import { Step } from ".";
import type { Duplo } from "@scripts/duplo";
import type { ZodSpace } from "@scripts/parser";
import type { PresetGenericResponse } from "@scripts/response";
import type { CurrentRequestObject } from "@scripts/request";
import { BuildedExtractStep } from "./builded/extract";
import { createInterpolation, type GetPropsWithTrueValue } from "@duplojs/utils";

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
	[P in ExtractKey<T>]?: { [x: string]: ZodSpace.ZodType } | ZodSpace.ZodType;
};

export type ExtractErrorFunction = (
	type: keyof ExtractObject,
	key: string,
	error: ZodSpace.ZodError
) => PresetGenericResponse;

export class ExtractStep<
	GenericExtractObject extends ExtractObject = ExtractObject,
	GenericStepNumber extends number = number,
> extends Step<
		GenericExtractObject,
		GenericStepNumber
	> {
	public catchError?: ExtractErrorFunction;

	public constructor(
		extractObject: GenericExtractObject,
		catchError: ExtractErrorFunction | undefined = undefined,
		descriptions: Description[] = [],
	) {
		super(extractObject, descriptions);
		this.catchError = catchError;
	}

	public build(instance: Duplo) {
		return Promise.resolve(
			new BuildedExtractStep(
				instance,
				this,
			),
		);
	}

	public static insertBlockName = {
		before: createInterpolation("beforeExtractStep(index: {index})"),
		after: createInterpolation("afterExtractStep(index: {index})"),

		beforeLevelOne: createInterpolation("beforeLevelOneExtractStep(index: {index}, one: {one})"),
		beforeTreatResultLevelOne: createInterpolation("beforeTreatResultLevelOneExtractStep(index: {index}, one: {one})"),
		beforeIndexingResultLevelOne: createInterpolation("beforeIndexingResultLevelOneExtractStep(index: {index}, one: {one})"),
		afterLevelOne: createInterpolation("afterLevelOneExtractStep(index: {index}, one: {one})"),

		beforeLevelTwo: createInterpolation("beforeLevelTwoExtractStep(index: {index}, one: {one}, two: {two})"),
		beforeTreatResultLevelTwo: createInterpolation("beforeTreatResultLevelTwoExtractStep(index: {index}, one: {one}, two: {two})"),
		beforeIndexingResultLevelTwo: createInterpolation("beforeIndexingResultLevelTwoExtractStep(index: {index}, one: {one}, two: {two})"),
		afterLevelTwo: createInterpolation("afterLevelTowExtractStep(index: {index}, one: {one}, two: {two})"),
	};
}

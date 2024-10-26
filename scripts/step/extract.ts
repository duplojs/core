import type { Description } from "@scripts/description";
import { Step } from ".";
import type { Duplo } from "@scripts/duplo";
import type { ZodSpace } from "@scripts/parser";
import type { PresetGenericResponse } from "@scripts/response";
import type { CurrentRequestObject } from "@scripts/request";
import { BuildedExtractStep } from "./builded/extract";
import type { GetPropsWithTrueValue } from "@utils/getPropsWithTrueValue";

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
}

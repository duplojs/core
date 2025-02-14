import { type Duplo } from "@scripts/duplo";
import { BuildedStep } from ".";
import { type ExtractErrorFunction, type ExtractStep, type ExtractObject, type ExtractKey } from "../extract";
import { insertBlock, mapped, maybeAwait, spread, StringBuilder } from "@utils/stringBuilder";
import { zod, ZodPresetChecker, type ZodSpace } from "@scripts/parser";
import ZodAccelerator, { type ZodAcceleratorParser, zodSchemaIsAsync } from "@duplojs/zod-accelerator";
import { type CurrentRequestObject } from "@scripts/request";
import { getTypedEntries, simpleClone } from "@duplojs/utils";

export type AcceleratedExtractObject<
	T extends object = CurrentRequestObject,
> = {
	[P in ExtractKey<T>]?: { [x: string]: ZodAcceleratorParser } | ZodAcceleratorParser;
};

export class BuildedExtractStep extends BuildedStep<ExtractStep> {
	public catchError: ExtractErrorFunction;

	public extractObject: ExtractObject | AcceleratedExtractObject;

	public constructor(
		instance: Duplo,
		step: ExtractStep,
	) {
		super(instance, step);
		this.catchError = step.catchError ?? instance.extractError;
		this.extractObject = simpleClone(step.parent);

		if (!this.instance.config.disabledZodAccelerator) {
			this.extractObject = getTypedEntries(this.extractObject)
				.reduce<AcceleratedExtractObject>(
					(pv, [key, value]) => {
						if (value instanceof zod.ZodType) {
							pv[key] = ZodAccelerator.build(value);
						} else {
							const deepExtract: Record<string, ZodAcceleratorParser<ZodSpace.ZodType, unknown>> = {};

							getTypedEntries(value)
								.forEach(
									([subKey, subValue]) => {
										deepExtract[subKey] = ZodAccelerator.build(subValue);
									},
								);

							pv[key] = deepExtract;
						}

						return pv;
					},
					{},
				);
		}
	}

	public toString(index: number): string {
		return spread(
			insertBlock(`setp-extract-(${index})-before`),
			mapped(
				getTypedEntries(this.step.parent),
				([key, value]) => {
					if (value instanceof zod.ZodType) {
						return value instanceof ZodPresetChecker
							? BuildedExtractStep.part.extractLevelOnePresetCheck(
								index,
								key,
								(<ZodPresetChecker>value).presetChecker.params.indexing,
							)
							: BuildedExtractStep.part.extractLevelOne(index, key, zodSchemaIsAsync(value));
					} else {
						return mapped(
							getTypedEntries(value),
							([subKey, subValue]) => subValue instanceof ZodPresetChecker
								? BuildedExtractStep.part.extractLevelTwoPresetCheck(
									index,
									key,
									subKey,
									(<ZodPresetChecker>subValue).presetChecker.params.indexing,
								)
								: BuildedExtractStep.part.extractLevelTwo(
									index,
									key,
									subKey,
									zodSchemaIsAsync(subValue),
								),
						);
					}
				},
			),
			insertBlock(`setp-extract-(${index})-after`),
		);
	}

	public static part = {
		extractLevelOne(index: number, one: string, async: boolean) {
			return /* js */`
			${insertBlock(`setp-extract-(${index})-(${one})-before`)}
		
			{
				let temp = ${maybeAwait(async)}this.steps[${index}]
					.extractObject["${one}"]
					.${async ? "safeParseAsync" : "safeParse"}(${StringBuilder.request}["${one}"])
		
				if(!temp.success){
					${StringBuilder.result} = this.steps[${index}].catchError(
						"${one}",
						undefined,
						temp.error,
					);
					break ${StringBuilder.label};
				}
		
				${StringBuilder.floor}.drop(
					"${one}",
					temp.data,
				);
			}
		
			${insertBlock(`setp-extract-(${index})-(${one})-after`)}
			`;
		},
		extractLevelTwo(index: number, one: string, two: string, async: boolean) {
			return /* js */`
			${insertBlock(`setp-extract-(${index})-(${one})-(${two})-before`)}
		
			{
				let temp = ${maybeAwait(async)}this.steps[${index}]
					.extractObject["${one}"]["${two}"]
					.${async ? "safeParseAsync" : "safeParse"}(${StringBuilder.request}["${one}"]?.["${two}"])
		
				if(!temp.success){
					${StringBuilder.result} = this.steps[${index}].catchError(
						"${one}",
						"${two}",
						temp.error,
					);
					break ${StringBuilder.label};
				}
		
				${StringBuilder.floor}.drop(
					"${two}",
					temp.data,
				);
			}
		
			${insertBlock(`setp-extract-(${index})-(${one})-(${two})-after`)}
			`;
		},
		extractLevelOnePresetCheck(index: number, one: string, presetCheckerIndexing?: string) {
			return /* js */`
			${insertBlock(`setp-extract-(${index})-(${one})-before`)}
		
			{
				let temp = await this.steps[${index}]
					.extractObject["${one}"].safeParseAsync(${StringBuilder.request}["${one}"])
		
				if(!temp.success){
					${StringBuilder.result} = temp.error.issues.at(-1)?.params?.response;
		
					if(${StringBuilder.result} instanceof this.Response) {
						break ${StringBuilder.label};
					}
		
					${StringBuilder.result} = this.steps[${index}].catchError(
						"${one}",
						undefined,
						temp.error,
					);
					break ${StringBuilder.label};
				}
		
				${presetCheckerIndexing ? `${StringBuilder.floor}.drop("${presetCheckerIndexing}", temp.data)` : ""}
			}
		
			${insertBlock(`setp-extract-(${index})-(${one})-after`)}
			`;
		},
		extractLevelTwoPresetCheck(index: number, one: string, two: string, presetCheckerIndexing?: string) {
			return /* js */`
			${insertBlock(`setp-extract-(${index})-(${one})-(${two})-before`)}
		
			{
				let temp = await this.steps[${index}]
					.extractObject["${one}"]["${two}"].safeParseAsync(${StringBuilder.request}["${one}"]?.["${two}"])
		
				if(!temp.success){
					${StringBuilder.result} = temp.error.issues.at(-1)?.params?.response;
		
					if(${StringBuilder.result} instanceof this.Response) {
						break ${StringBuilder.label};
					}
		
					${StringBuilder.result} = this.steps[${index}].catchError(
						"${one}",
						"${two}",
						temp.error,
					);
					break ${StringBuilder.label};
				}
		
				${presetCheckerIndexing ? `${StringBuilder.floor}.drop("${presetCheckerIndexing}", temp.data)` : ""}
			}
		
			${insertBlock(`setp-extract-(${index})-(${one})-(${two})-after`)}
			`;
		},
	};
}

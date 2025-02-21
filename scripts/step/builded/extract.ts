import { type Duplo } from "@scripts/duplo";
import { BuildedStep } from ".";
import { ExtractStep, type ExtractErrorFunction, type ExtractObject, type ExtractKey } from "../extract";
import { insertBlock, mapped, maybeAwait, spread, StringBuilder } from "@utils/stringBuilder";
import { zod, type ZodSpace } from "@scripts/parser";
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
		const insertBlockNameBefore
			= ExtractStep.insertBlockName.before({ index: index.toString() });
		const insertBlockNameAfter
			= ExtractStep.insertBlockName.after({ index: index.toString() });

		return spread(
			insertBlock(insertBlockNameBefore),
			mapped(
				getTypedEntries(this.step.parent),
				([key, value]) => {
					if (value instanceof zod.ZodType) {
						return BuildedExtractStep.part.extractLevelOne(index, key, zodSchemaIsAsync(value));
					} else {
						return mapped(
							getTypedEntries(value),
							([subKey, subValue]) => BuildedExtractStep.part.extractLevelTwo(
								index,
								key,
								subKey,
								zodSchemaIsAsync(subValue),
							),
						);
					}
				},
			),
			insertBlock(insertBlockNameAfter),
		);
	}

	public static part = {
		extractLevelOne(index: number, one: string, async: boolean) {
			const insertBlockNameBefore
				= ExtractStep.insertBlockName.beforeLevelOne({
					index: index.toString(),
					one,
				});
			const insertBlockNameBeforeTreatResult
				= ExtractStep.insertBlockName.beforeTreatResultLevelOne({
					index: index.toString(),
					one,
				});
			const insertBlockNameBeforeIndexingResult
				= ExtractStep.insertBlockName.beforeIndexingResultLevelOne({
					index: index.toString(),
					one,
				});
			const insertBlockNameAfter
				= ExtractStep.insertBlockName.afterLevelOne({
					index: index.toString(),
					one,
				});

			return /* js */`
			{
				${insertBlock(insertBlockNameBefore)}

				let temp = ${maybeAwait(async)}this.steps[${index}]
					.extractObject["${one}"]
					.${async ? "safeParseAsync" : "safeParse"}(${StringBuilder.request}["${one}"])

				${insertBlock(insertBlockNameBeforeTreatResult)}
		
				if(!temp.success){
					${StringBuilder.result} = this.steps[${index}].catchError(
						"${one}",
						undefined,
						temp.error,
					);
					break ${StringBuilder.label};
				}

				${insertBlock(insertBlockNameBeforeIndexingResult)}
		
				${StringBuilder.floor}.drop(
					"${one}",
					temp.data,
				);

				${insertBlock(insertBlockNameAfter)}
			}
			`;
		},
		extractLevelTwo(index: number, one: string, two: string, async: boolean) {
			const insertBlockNameBefore
				= ExtractStep.insertBlockName.beforeLevelTwo({
					index: index.toString(),
					one,
					two,
				});
			const insertBlockNameBeforeTreatResult
				= ExtractStep.insertBlockName.beforeTreatResultLevelTwo({
					index: index.toString(),
					one,
					two,
				});
			const insertBlockNameBeforeIndexingResult
				= ExtractStep.insertBlockName.beforeIndexingResultLevelTwo({
					index: index.toString(),
					one,
					two,
				});
			const insertBlockNameAfter
				= ExtractStep.insertBlockName.afterLevelTwo({
					index: index.toString(),
					one,
					two,
				});

			return /* js */`
			{
				${insertBlock(insertBlockNameBefore)}

				let temp = ${maybeAwait(async)}this.steps[${index}]
					.extractObject["${one}"]["${two}"]
					.${async ? "safeParseAsync" : "safeParse"}(${StringBuilder.request}["${one}"]?.["${two}"])

				${insertBlock(insertBlockNameBeforeTreatResult)}
		
				if(!temp.success){
					${StringBuilder.result} = this.steps[${index}].catchError(
						"${one}",
						"${two}",
						temp.error,
					);
					break ${StringBuilder.label};
				}

				${insertBlock(insertBlockNameBeforeIndexingResult)}
		
				${StringBuilder.floor}.drop(
					"${two}",
					temp.data,
				);

				${insertBlock(insertBlockNameAfter)}
			}
			`;
		},
	};
}

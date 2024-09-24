import type { ExtractObject } from "@scripts/duplose";
import { getTypedEntries } from "./getTypedEntries";
import { zod, ZodPresetChecker } from "@scripts/parser";
import { zodSchemaIsAsync } from "@duplojs/zod-accelerator";

export class StringBuilder {
	public static result = "result";

	public static floor = "floor";

	public static label = "Execution";

	public static request = "request";

	public static options = "options";

	public static input = "input";
}

export function mapped<T extends any[]>(
	arr: T,
	callback: (value: T[0], index: number) => string,
) {
	return arr.map(callback).join("\n");
}

export function spread(...args: (string | false | undefined | null)[]) {
	return args.filter((value) => !!value).join("\n");
}

export function condition(bool: boolean, block: () => string) {
	return bool ? block() : "";
}

export function insertBlock(name: string) {
	return `\n/* ${name} */\n/* end_block */\n`;
}

export function checkResult(block = "") {
	return `if(${StringBuilder.result} instanceof this.Response){\n${block}\nbreak ${StringBuilder.label};\n}`;
}

export function maybeAwait(async: boolean) {
	return async ? "await " : "";
}

export function skipStep(bool: boolean, index: number, block: string) {
	return bool
		? /* js */`
		${insertBlock(`step-skip-(${index})-before`)}

		if(!this.steps[${index}].params.skip(${StringBuilder.floor}.pickup)){
			${block}
		}
		`
		: block;
}

export function extractLevelOne(one: string, async: boolean) {
	return /* js */`
	${insertBlock(`extract-(${one})-before`)}

	{
		let temp = ${async ? "await " : ""}this.extract["${one}"].${async ? "safeParseAsync" : "safeParse"}(${StringBuilder.request}["${one}"])

		if(!temp.success){
			${StringBuilder.result} = this.extractError(
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

	${insertBlock(`extract-(${one})-after`)}
	`;
}

export function extractLevelTwo(one: string, two: string, async: boolean) {
	return /* js */`
	${insertBlock(`extract-(${one})-(${two})-before`)}

	{
		let temp = ${async ? "await " : ""}this.extract["${one}"]["${two}"].${async ? "safeParseAsync" : "safeParse"}(${StringBuilder.request}["${one}"]?.["${two}"])

		if(!temp.success){
			${StringBuilder.result} = this.extractError(
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

	${insertBlock(`extract-(${one})-(${two})-after`)}
	`;
}

export function extractLevelOnePresetCheck(one: string, presetCheckerIndexing?: string) {
	return /* js */`
	${insertBlock(`extract-(${one})-before`)}

	{
		let temp = await this.extract["${one}"].safeParseAsync(${StringBuilder.request}["${one}"])

		if(!temp.success){
			${StringBuilder.result} = temp.error.issues.at(-1)?.params?.response;

			if(${StringBuilder.result} instanceof this.Response) {
				break ${StringBuilder.label};
			}

			${StringBuilder.result} = this.extractError(
				"${one}",
				undefined,
				temp.error,
			);
			break ${StringBuilder.label};
		}

		${presetCheckerIndexing ? `${StringBuilder.floor}.drop("${presetCheckerIndexing}", temp.data)` : ""}
	}

	${insertBlock(`extract-(${one})-after`)}
	`;
}

export function extractLevelTwoPresetCheck(one: string, two: string, presetCheckerIndexing?: string) {
	return /* js */`
	${insertBlock(`extract-(${one})-(${two})-before`)}

	{
		let temp = await this.extract["${one}"]["${two}"].safeParseAsync(${StringBuilder.request}["${one}"]?.["${two}"])

		if(!temp.success){
			${StringBuilder.result} = temp.error.issues.at(-1)?.params?.response;

			if(${StringBuilder.result} instanceof this.Response) {
				break ${StringBuilder.label};
			}

			${StringBuilder.result} = this.extractError(
				"${one}",
				"${two}",
				temp.error,
			);
			break ${StringBuilder.label};
		}

		${presetCheckerIndexing ? `${StringBuilder.floor}.drop("${presetCheckerIndexing}", temp.data)` : ""}
	}

	${insertBlock(`extract-(${one})-(${two})-after`)}
	`;
}

export function extractPart(extract?: ExtractObject) {
	return extract
		? spread(
			insertBlock("extract-before"),
			mapped(
				getTypedEntries(extract),
				([key, value]) => {
					if (value instanceof zod.ZodType) {
						return value instanceof ZodPresetChecker
							? extractLevelOnePresetCheck(
								key,
								(<ZodPresetChecker>value).presetChecker.params.indexing,
							)
							: extractLevelOne(key, zodSchemaIsAsync(value));
					} else {
						return mapped(
							getTypedEntries(value),
							([subKey, subValue]) => subValue instanceof ZodPresetChecker
								? extractLevelTwoPresetCheck(
									key,
									subKey,
									(<ZodPresetChecker>subValue).presetChecker.params.indexing,
								)
								: extractLevelTwo(key, subKey, zodSchemaIsAsync(subValue)),
						);
					}
				},
			),
			insertBlock("extract-after"),
		)
		: "";
}

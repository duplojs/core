import type { ExtractObject } from "@scripts/duplose";
import { getTypedEntries } from "./getTypedEntries";
import { ZodType } from "zod";

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

export function checkResult() {
	return `if(${StringBuilder.result} instanceof this.Response){\nbreak ${StringBuilder.label};\n}`;
}

export function maybeAwait(async: boolean) {
	return async ? "await " : "";
}

export function skipStep(bool: boolean, index: number, block: string) {
	return bool
		? /* js */`
		${insertBlock(`step-skip-(${index})-before`)}

		if(!this.steps[${index}].params.skip(floor.pickup)){
			${block}
		}
		`
		: block;
}

export function extractLevelOne(one: string) {
	return /* js */`
	${insertBlock(`extract-(${one})-before`)}

	{
		let temp = this.extract["${one}"].safeParse(${StringBuilder.request}["${one}"])

		if(!temp.success){
			${StringBuilder.result} = this.extractError(
				"${one}",
				undefined,
				temp.error,
			);
			break ${StringBuilder.label};
		}

		floor.drop(
			"${one}",
			temp.data,
		);
	}

	${insertBlock(`extract-(${one})-after`)}
	`;
}

export function extractLevelTwo(one: string, two: string) {
	return /* js */`
	${insertBlock(`extract-(${one})-(${two})-before`)}

	{
		let temp = this.extract["${one}"]["${two}"].safeParse(${StringBuilder.request}["${one}"]?.["${two}"])

		if(!temp.success){
			${StringBuilder.result} = this.extractError(
				"${one}",
				"${two}",
				temp.error,
			);
			break ${StringBuilder.label};
		}

		floor.drop(
			"${two}",
			temp.data,
		);
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
				([key, value]) => value instanceof ZodType
					? extractLevelOne(key)
					: mapped(
						Object.keys(value),
						(subKey) => extractLevelTwo(key, subKey),
					),
			),
			insertBlock("extract-after"),
		)
		: "";
}
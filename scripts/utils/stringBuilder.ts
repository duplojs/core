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
		if(!this.steps[${index}].params.skip(${StringBuilder.floor}.pickup)){
			${block}
		}
		`
		: block;
}

import type { AnyFunction } from "./types";

const { eval: shadowEval } = global;

export interface SafeEvalParams {
	args?: string[];
	autoLaunch?: boolean;
	bind?: object;
	content: string;
	forceAsync?: boolean;
	name?: string;
	unsafe?: boolean;
}

export const advancedEvalRules = [
	/global/,
	/globalThis/,
	/window/,
	/eval/,
	/Function/,
	/import/,
	/require/,
	/shadowEval/,
	/Window/,
	/document/,
	/module/,
	/process/,
];

export class AdvancedEvalError extends Error {
	public constructor(
		public functionInString: string,
	) {
		super("Function contain unsafe word.");
	}
}

export function advancedEval<T extends unknown>({
	forceAsync,
	content,
	autoLaunch,
	bind,
	args = [],
	name,
	unsafe,
}: SafeEvalParams): T {
	const functionInString = `(
		${content.includes("await") || forceAsync ? "async " : ""}function ${name || ""}(${args.join(", ")}){
			"use strict";
			${content}
		}
	)`;

	if (!unsafe && !advancedEvalRules.every((regex) => !regex.test(functionInString))) {
		throw new AdvancedEvalError(functionInString);
	}

	let fnc = shadowEval(functionInString) as AnyFunction;

	if (bind) {
		fnc = fnc.bind(bind);
	}

	if (autoLaunch) {
		return fnc();
	}

	return fnc as T;
}

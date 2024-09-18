import type { AnyFunction } from "./types";

const { eval: shadowEval } = global;

export interface AdvancedEvalParams {
	args?: string[];
	bind?: unknown;
	content: string;
	forceAsync?: boolean;
	name?: string;
}

export function advancedEval<T extends unknown = unknown>({
	forceAsync,
	content,
	bind,
	args = [],
	name,
}: AdvancedEvalParams): T {
	const functionInString = `(
		${content.includes("await") || forceAsync ? "async " : ""}function ${name || ""}(${args.join(", ")}){
			"use strict";
			${content}
		}
	)`;

	let fnc = shadowEval(functionInString) as AnyFunction;

	if (bind) {
		fnc = fnc.bind(bind);
	}

	return fnc as T;
}

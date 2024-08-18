import type { AnyFunction } from "./types";

const { eval: shadowEval } = global;

export interface AdvancedEvalParams {
	args?: string[];
	autoLaunch?: boolean;
	bind?: unknown;
	content: string;
	forceAsync?: boolean;
	name?: string;
	unsafe?: boolean;
}

export const bannedWords = [
	"global",
	"globalThis",
	"window",
	"eval",
	"Function",
	"import",
	"require",
	"shadowEval",
	"Window",
	"document",
	"module",
	"process",
	"bannedWords",
	"advancedEval",
];

export class AdvancedEvalError extends Error {
	public constructor(
		public bannedWord: string,
		public functionInString: string,
	) {
		super(`Function contain unsafe word "${bannedWord}".`);
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
}: AdvancedEvalParams): T {
	const functionInString = `(
		${content.includes("await") || forceAsync ? "async " : ""}function ${name || ""}(${args.join(", ")}){
			"use strict";
			${content}
		}
	)`;

	if (!unsafe) {
		bannedWords.forEach((bannedWord) => {
			if (functionInString.includes(bannedWord)) {
				throw new AdvancedEvalError(bannedWord, functionInString);
			}
		});
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

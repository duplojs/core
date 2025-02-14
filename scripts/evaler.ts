import { type AnyFunction } from "@duplojs/utils";

const shadowEval = eval;

export interface EvalerParams {
	args?: string[];
	bind?: unknown;
	content: string;
	forceAsync?: boolean;
	name?: string;
}

export abstract class Evaler<
	GenericParams extends EvalerParams = EvalerParams,
> {
	public makeFunction<T>(
		{
			forceAsync,
			content,
			bind,
			args = [],
			name,
		}: GenericParams,
	): Promise<T> {
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

		return Promise.resolve<any>(fnc);
	}
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { GetPresetCheckerGeneric, PresetChecker } from "@scripts/builder/checker";
import type { Checker, CheckerOutput, GetCheckerGeneric } from "@scripts/checker";
import { type RefinementCtx, ZodEffects, type infer as ZodInfer, ZodType } from "zod";
import { zod } from ".";
import { MissingHandlerCheckerError } from "@scripts/error/missingHandlerCheckerError";
import { makeFloor } from "@scripts/floor";
import { findZodTypeInZodSchema } from "@utils/findZodTypeInZodSchema";
import type { ContractResponse } from "@scripts/response";

export type PresetCheckerContract<
	Input extends unknown,
> = PresetChecker<
	Checker<object | undefined, unknown, CheckerOutput>,
	string,
	string,
	ContractResponse,
	Input
>;

declare module "zod" {
	interface ZodType {
		presetCheck<
			T extends PresetCheckerContract<ZodInfer<this>>,
			GPCG extends GetPresetCheckerGeneric<T>,
			GCG extends GetCheckerGeneric<GPCG["checker"]>,
			InputError extends (
				GPCG["newInput"] extends ZodInfer<this>
					? []
					: ["Input zod schema does not match with checker input.", never]
			),
		>(presetChecker: T, ...args: InputError): ZodEffects<
			this,
			Extract<GCG["output"], { info: GPCG["info"] }>["data"],
			this["_input"]
		>;
	}

	interface ZodEffects<
		T extends zod.ZodTypeAny,
		Output = zod.output<T>,
		Input = zod.input<T>,
	> {
		_presetCheck?: boolean;
	}
}

ZodType.prototype.presetCheck = function(presetChecker, ...args) {
	if (!presetChecker.checker.handler) {
		throw new MissingHandlerCheckerError(presetChecker.checker);
	}

	const checkerHandler = presetChecker.checker.handler;
	const checkerOptions = presetChecker.checker.options;

	const presetCheckerTransformInput = presetChecker.params.transformInput ?? ((value) => value);
	const presetCheckerOptions = presetChecker.params.options;
	const presetCheckerResult = presetChecker.params.result instanceof Array
		? presetChecker.params.result
		: [presetChecker.params.result];
	const presetCheckerCatch = presetChecker.params.catch;

	const options = {
		...checkerOptions,
		...presetCheckerOptions,
	};

	const pickup = makeFloor().pickup;

	function traitResult(result: CheckerOutput, ctx: RefinementCtx) {
		if (!presetCheckerResult.includes(result.info)) {
			ctx.addIssue({
				code: "custom",
				message: "",
				params: {
					response: presetCheckerCatch(
						result.info,
						result.data,
						pickup,
					),
				},
			});

			return zod.NEVER;
		}

		return result.data;
	}

	const effect = zod.effect(
		this,
		{
			type: "transform",
			transform: (value, ctx) => {
				const result = checkerHandler(
					presetCheckerTransformInput(value),
					(info, data) => ({
						info,
						data,
					}),
					options,
				);

				if (result instanceof Promise) {
					return result.then((value) => traitResult(value, ctx));
				} else {
					return traitResult(result, ctx);
				}
			},
		},
	);

	effect._presetCheck = true;

	return effect;
};

export function zodSchemaHasPresetChecker(zodSchema: ZodType): boolean {
	const zodSchemaEffects = findZodTypeInZodSchema(
		[ZodEffects],
		zodSchema,
	);

	return !!zodSchemaEffects.find(
		(value) => !!value._presetCheck,
	);
}

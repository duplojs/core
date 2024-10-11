import type { GetPresetCheckerGeneric, PresetChecker } from "@scripts/builder/checker";
import type { Checker, CheckerOutput } from "@scripts/checker";
import { type ZodEffectsDef, ZodEffects, type infer as ZodInfer, ZodType, type input, z as zod, type ZodTypeAny, ZodFirstPartyTypeKind } from "zod";
import { MissingHandlerCheckerError } from "@scripts/error/missingHandlerCheckerError";
import { makeFloor } from "@scripts/floor";
import { findZodTypeInZodSchema } from "@utils/findZodTypeInZodSchema";

export type PresetCheckerContract<
	Input extends unknown,
> = PresetChecker<
	Checker,
	any,
	any,
	any,
	Input
>;

declare module "zod" {
	interface ZodType {
		presetCheck<
			GenericPresetChecker extends PresetCheckerContract<ZodInfer<this>>,
		>(presetChecker: GenericPresetChecker): ZodPresetChecker<
			this,
			GenericPresetChecker
		>;
	}
}

export class ZodPresetChecker<
	GenericZodType extends ZodTypeAny = ZodTypeAny,
	GenericPresetChecker extends PresetChecker = PresetChecker,
	_GenericInput extends unknown = input<GenericZodType>,
> extends ZodEffects<
		GenericZodType,
		GetPresetCheckerGeneric<GenericPresetChecker>["outputData"],
		_GenericInput
	> {
	public presetChecker: GenericPresetChecker;

	public constructor(
		{ presetChecker, ...def }: ZodEffectsDef<GenericZodType> & { presetChecker: GenericPresetChecker },
	) {
		super(def);
		this.presetChecker = presetChecker;
	}
}

ZodType.prototype.presetCheck = function(presetChecker, ..._args) {
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

	return new ZodPresetChecker({
		presetChecker,
		schema: this,
		typeName: ZodFirstPartyTypeKind.ZodEffects,
		effect: {
			type: "transform",
			transform: (value, ctx) => new Promise<CheckerOutput>(
				(resolve, reject) => {
					try {
						const result = checkerHandler(
							presetCheckerTransformInput(value),
							(info, data) => ({
								info,
								data,
							}),
							options,
						);

						if (result instanceof Promise) {
							result
								.then(resolve)
								.catch(reject);
						} else {
							resolve(result);
						}
					} catch (error) {
						reject(error as Error);
					}
				},
			).then(
				(result) => {
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
				},
			),
		},
	});
};

export function zodSchemaHasPresetChecker(zodSchema: ZodType): zodSchema is ZodPresetChecker {
	const [zodPresetChecker] = findZodTypeInZodSchema(
		[ZodPresetChecker],
		zodSchema,
	);

	return !!zodPresetChecker;
}

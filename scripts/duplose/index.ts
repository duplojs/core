import type { PresetGenericResponse, Response } from "@scripts/response";
import type { Description } from "@scripts/description";
import type { CurrentRequestObject } from "@scripts/request";
import type { Step } from "@scripts/step";
import type { AnyFunction, ObjectKey } from "@utils/types";
import { zod, type ZodSpace } from "@scripts/parser";
import { ProcessStep } from "@scripts/step/process";
import type { Duplo } from "@scripts/duplo";
import type { makeFloor } from "@scripts/floor";
import type { BuildedStep } from "@scripts/step/builded";
import type { PreflightStep } from "@scripts/step/preflight";
import type { BuildedPreflightStep } from "@scripts/step/builded/preflight";
import type { GetPropsWithTrueValue } from "@utils/getPropsWithTrueValue";
import type { ContractResponseError } from "@scripts/error/contractResponseError";
import { type BuildedHooksRouteLifeCycle, HooksRouteLifeCycle } from "@scripts/hook/routeLifeCycle";
import { type ZodAcceleratorParser, ZodAccelerator } from "@duplojs/zod-accelerator";
import { getTypedEntries } from "@utils/getTypedEntries";
import { InjectBlockNotfoundError } from "@scripts/error/injectBlockNotfoundError";
import { StringBuilder } from "@utils/stringBuilder";
import { DuplicateExtentionkeyError } from "@scripts/error/duplicateExtentionKeyError";
import { Evaler, type EvalerParams } from "@scripts/evaler";

export interface DuploseBuildedFunctionContext<
	T extends Duplose = Duplose,
> {
	makeFloor: typeof makeFloor;
	Response: typeof Response;
	extract?: ExtractObject | AcceleratedExtractObject;
	extractError: ExtractErrorFunction;
	preflightSteps: BuildedPreflightStep[];
	steps: BuildedStep[];
	extensions: DuploseContextExtensions;
	ContractResponseError: typeof ContractResponseError;
	duplose: T;
	duplo: Duplo;
}

export interface DuploseContextExtensions {
	injectedFunction: EditInjectFunction[];
	[x: ObjectKey]: unknown;
}

export type ExtractErrorFunction = (
	type: keyof ExtractObject,
	key: string,
	error: ZodSpace.ZodError
) => PresetGenericResponse;

export interface DisabledExtractKey {
	method: true;
}

export type ExtractKey<
	T extends object = CurrentRequestObject,
> = Exclude<
	keyof T,
	GetPropsWithTrueValue<DisabledExtractKey>
>;

export type ExtractObject<
	T extends object = CurrentRequestObject,
> = {
	[P in ExtractKey<T>]?: { [x: string]: ZodSpace.ZodType } | ZodSpace.ZodType;
};

export interface AcceleratedExtractObject {
	[x: ObjectKey]:
		| Record<string, ZodAcceleratorParser<ZodSpace.ZodType, unknown>>
		| ZodAcceleratorParser<ZodSpace.ZodType, unknown>;
}

export type DefineHooksRouteLifeCycle<
	Request extends CurrentRequestObject = any,
	ReturnType extends unknown = undefined,
> = <
	T extends keyof BuildedHooksRouteLifeCycle<Request>,
>(hookName: T, subscriber: BuildedHooksRouteLifeCycle<Request>[T]) => ReturnType;

export type EditingDuploseFunction = (input: string) => string;

export type EditInjectPos = "first" | "last" | "top" | "bottom";

export type EditInjectFunction = (
	request: CurrentRequestObject,
	context: DuploseBuildedFunctionContext,
	result: unknown,
) => void;

export interface DuploseEvalerParams extends EvalerParams {
	duplose: Duplose;
}

export class DuploseEvaler extends Evaler<DuploseEvalerParams> {

}

export abstract class Duplose<
	GenericBuildedFunction extends AnyFunction = any,
	_GenericRequest extends CurrentRequestObject = any,
	_GenericPreflightStep extends PreflightStep = any,
	_GenericExtract extends ExtractObject = any,
	_GenericStep extends Step = any,
	_GenericFloorData extends object = any,
> {
	public instance?: Duplo;

	public hooks = new HooksRouteLifeCycle<CurrentRequestObject>();

	public preflightSteps: PreflightStep[] = [];

	public extract?: ExtractObject;

	public extractError?: ExtractErrorFunction;

	public steps: Step[] = [];

	public editingFunctions: EditingDuploseFunction[] = [];

	public extensions: DuploseContextExtensions = {
		injectedFunction: [],
	};

	public descriptions: Description[] = [];

	public origin?: unknown;

	public evaler?: DuploseEvaler;

	public constructor(descriptions: Description[] = []) {
		this.descriptions.push(...descriptions);
	}

	public setExtract(
		extract: ExtractObject,
		extractError?: ExtractErrorFunction,
		descriptions: Description[] = [],
	) {
		this.extract = extract;
		this.extractError = extractError;

		this.descriptions.push(...descriptions);
	}

	public addPreflightSteps(...preflightSteps: PreflightStep[]) {
		this.preflightSteps.push(...preflightSteps);
	}

	public addStep(...steps: Step[]) {
		this.steps.push(...steps);
	}

	public getAllHooks() {
		const hooks = new HooksRouteLifeCycle();

		hooks.import(this.hooks);

		this.steps
			.filter((step): step is ProcessStep => step instanceof ProcessStep)
			.forEach((step) => void hooks.import(step.parent.getAllHooks()));

		this.preflightSteps.forEach((step) => {
			hooks.import(step.parent.getAllHooks());
		});

		return hooks;
	}

	protected acceleratedExtract() {
		if (this.extract) {
			return getTypedEntries(this.extract)
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

	protected applyEditingFunctions(content: string) {
		let editedContent = content;

		this.editingFunctions.forEach(
			(editingFunction) => {
				editedContent = editingFunction(editedContent);
			},
		);

		return editedContent;
	}

	public get edition() {
		return {
			injectCode: (
				entryPoint: string,
				code: string,
				pos: EditInjectPos = "last",
			) => {
				const formatedEntryPoint = entryPoint.replace(/(\(|\))/g, (match) => `\\${match}`);
				const regExpBlockName = new RegExp(`\\/\\* ${formatedEntryPoint} \\*\\/([^]*)`, "s");
				const regExpEndBlock = /\/\* end_block \*\/([^]*)/s;

				this.editingFunctions.push(
					(input) => {
						if (!regExpBlockName.test(input)) {
							throw new InjectBlockNotfoundError(entryPoint, this);
						}

						const [beforeBlockName, afterBlockName] = input.split(regExpBlockName);

						const [insideBlock, afterEndBlock] = afterBlockName.split(regExpEndBlock);

						return `
							${beforeBlockName}
							${pos === "top" ? code : ""}
							/* ${entryPoint} */
							${pos === "first" ? code : ""}
							${insideBlock}
							${pos === "last" ? code : ""}
							/* end_block */
							${pos === "bottom" ? code : ""}
							${afterEndBlock}
						`;
					},
				);
			},
			injectFunction: (
				entryPoint: string,
				editInjectFunction: EditInjectFunction,
				pos: EditInjectPos = "last",
			) => {
				const index = this.extensions.injectedFunction.length;
				this.extensions.injectedFunction.push(editInjectFunction as EditInjectFunction);
				this.edition.injectCode(
					entryPoint,
					/* js */`
						this.extensions.injectedFunction[${index}](
							${StringBuilder.request}, 
							this,
							${StringBuilder.result},
						);
					`,
					pos,
				);
			},
			addExtensions: (
				extensions: Partial<DuploseContextExtensions> & Record<ObjectKey, unknown>,
			) => {
				getTypedEntries(extensions).forEach(
					([key, value]) => {
						if (key in this.extensions) {
							throw new DuplicateExtentionkeyError(key, this);
						}

						this.extensions[key] = value;
					},
				);
			},
		};
	}

	public hasDuplose(duplose: Duplose, deep = Infinity) {
		if (deep === 0) {
			return false;
		} else if (duplose === this) {
			return true;
		}

		for (const preflight of this.preflightSteps) {
			if (preflight.parent.hasDuplose(duplose, deep - 1)) {
				return true;
			}
		}

		for (const step of this.steps) {
			if (
				step.parent instanceof Duplose
				&& step.parent.hasDuplose(duplose, deep - 1)
			) {
				return true;
			}
		}

		return false;
	}

	public abstract build(): Promise<GenericBuildedFunction>;

	public static readonly defaultEvaler = new DuploseEvaler();
}

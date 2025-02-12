import type { Response } from "@scripts/response";
import type { Description } from "@scripts/description";
import type { CurrentRequestObject } from "@scripts/request";
import type { Step } from "@scripts/step";
import type { AnyFunction, ObjectKey } from "@utils/types";
import { ProcessStep } from "@scripts/step/process";
import type { Duplo } from "@scripts/duplo";
import type { makeFloor } from "@scripts/floor";
import type { BuildedStep } from "@scripts/step/builded";
import type { BuildedPreflightStep } from "@scripts/step/builded/preflight";
import type { ContractResponseError } from "@scripts/error/contractResponseError";
import { type BuildedHooksRouteLifeCycle, HooksRouteLifeCycle } from "@scripts/hook/routeLifeCycle";
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

export interface DuploseDefinition {
	steps: Step[];
	descriptions: Description[];
}

export interface DuploseEvalerParams extends EvalerParams {
	duplose: Duplose;
}

export class DuploseEvaler extends Evaler<DuploseEvalerParams> {

}

export abstract class Duplose<
	GenericDuploseDefinition extends DuploseDefinition = DuploseDefinition,
	_GenericRequest extends CurrentRequestObject = any,
	_GenericFloorData extends object = any,
> {
	public readonly definiton: GenericDuploseDefinition;

	public hooks = new HooksRouteLifeCycle<_GenericRequest>();

	public instance?: Duplo;

	public editingFunctions: EditingDuploseFunction[] = [];

	public extensions: DuploseContextExtensions = {
		injectedFunction: [],
	};

	public origin?: unknown;

	public evaler?: DuploseEvaler;

	public constructor(definiton: GenericDuploseDefinition) {
		this.definiton = definiton;
	}

	public getAllHooks() {
		const hooks = new HooksRouteLifeCycle<_GenericRequest>();

		hooks.import(this.hooks);

		this.definiton
			.steps
			.filter((step): step is ProcessStep => step instanceof ProcessStep)
			.forEach((step) => void hooks.import(step.parent.getAllHooks()));

		return hooks;
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

	public hasDuplose(duplose: Duplose<any, any, any>, deep = Infinity) {
		if (deep === 0) {
			return false;
		} else if (duplose === this) {
			return true;
		}

		for (const step of this.definiton.steps) {
			if (
				step.parent instanceof Duplose
				&& step.parent.hasDuplose(duplose, deep - 1)
			) {
				return true;
			}
		}

		return false;
	}

	public hook<
		T extends keyof BuildedHooksRouteLifeCycle<_GenericRequest>,
	>(hookName: T, subscriber: BuildedHooksRouteLifeCycle<_GenericRequest>[T]) {
		this.hooks[hookName].addSubscriber(subscriber as AnyFunction);

		return this;
	}

	public abstract build(): Promise<AnyFunction>;

	public static readonly defaultEvaler = new DuploseEvaler();
}

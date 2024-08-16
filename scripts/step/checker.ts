import { Step } from ".";
import type { Response } from "@scripts/response";
import type { Description } from "@scripts/description";
import { insertBlock } from "@utils/insertBlock";
import type { Checker, CheckerOutput } from "@scripts/checker";
import type { Floor } from "@scripts/floor";

export interface CheckerGenericObject {
	options: object;
	input: unknown;
	output: CheckerOutput;
}

export interface CheckerStepParams<
	CheckerGeneric extends CheckerGenericObject = CheckerGenericObject,
	Info extends string | string[] = string,
	Key extends string = string,
	CatchResponse extends Response = Response,
	FloorData extends object = object,
	Skip extends (() => boolean) | undefined = undefined,
> {
	input(pickup: Floor<FloorData>["pickup"]): CheckerGeneric["input"];
	result?:
		| (Info & CheckerGeneric["output"]["info"])
		| (Info[] & CheckerGeneric["output"]["info"][]);
	indexing?: Key;
	catch(
		info: Exclude<CheckerGeneric["output"], { info: Info }>["info"],
		data: Exclude<CheckerGeneric["output"], { info: Info }>["data"],
		pickup: Floor<FloorData>["pickup"]
	): NoInfer<CatchResponse>;
	options?:
		| Partial<CheckerGeneric["options"]>
		| ((pickup: Floor<FloorData>["pickup"]) => Partial<CheckerGeneric["options"]>);
	skip?: Skip;
}

export class CheckerStep extends Step<Checker> {
	public params: CheckerStepParams;

	public constructor(
		checker: Checker,
		params: CheckerStepParams,
		descriptions: Description[] = [],
	) {
		super(checker, descriptions);

		if (typeof params.options === "function") {
			const originalOptions = params.options;
			params.options = (pickup) => ({
				...checker.options,
				...originalOptions(pickup),
			});
		}

		if (typeof params.options === "object") {
			params.options = {
				...checker.options,
				...params.options,
			};
		}

		this.params = params;
	}

	public toString(): string {
		const async = this.parent.constructor.name === "AsyncFunction"
			? "await "
			: "";
		return /* js */`
		${insertBlock("step-cut-({index})-before-function")}

		result = ${async}this.steps[{index}].parent(floor, request);

		${insertBlock("step-cut-({index})-before-drop")}

		${this.drop.map((key) => `floor.drop("${key}", result["${key}"]);`).join("\n")}

		${insertBlock("step-cut-({index})-after")}
		`;
	}
}

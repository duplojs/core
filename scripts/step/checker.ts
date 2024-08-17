import { Step } from ".";
import type { Response } from "@scripts/response";
import type { Description } from "@scripts/description";
import { condition, insertBlock, maybeAwait, skipStep, StringBuilder } from "@utils/stringBuilder";
import type { Checker, GetCheckerGeneric } from "@scripts/checker";
import type { Floor } from "@scripts/floor";

export interface CheckerStepParams<
	CheckerGeneric extends GetCheckerGeneric = GetCheckerGeneric,
	Info extends string | string[] = string,
	Key extends string = string,
	CatchResponse extends Response = Response,
	FloorData extends object = object,
	Skip extends (() => boolean) | undefined = undefined,
> {
	input(pickup: Floor<FloorData>["pickup"]): CheckerGeneric["input"];
	result:
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
		} else if (params.options) {
			params.options = {
				...checker.options,
				...params.options,
			};
		}

		this.params = params;
	}

	public toString(index: number) {
		const async = this.parent.constructor.name === "AsyncFunction";

		const options = typeof this.params.options === "function"
			? /* js */`this.steps[${index}].params.options`
			: /* js */`this.steps[${index}].params.options(${StringBuilder.floor}.pickup)`;

		const checkResult = this.params.result instanceof Array
			? /* js */`this.steps[${index}].params.result !== ${StringBuilder.result}.info`
			: /* js */`!this.steps[${index}].params.result.includes(${StringBuilder.result}.info)`;

		const indexing = condition(
			Boolean(this.params.indexing),
			() => /* js */`${StringBuilder.floor}.drop(this.steps[${index}].params.indexing, ${StringBuilder.result}.data)`,
		);

		return skipStep(
			Boolean(this.params.skip),
			index,
			/* js */`
			${insertBlock(`step-checker-(${index})-before`)}

			${StringBuilder.result} = ${maybeAwait(async)}this.steps[${index}].parent.handler(
				this.steps[${index}].params.input(${StringBuilder.floor}.pickup),
				(info, data) => ({info, data}),
				${options},
			);

			${insertBlock(`step-checker-(${index})-before-treat-result`)}

			if(${checkResult}){
				${StringBuilder.result} = this.steps[${index}].params.catch(
					${StringBuilder.result}.info, 
					${StringBuilder.result}.data, 
					${StringBuilder.floor}.pickup
				);

				break ${StringBuilder.label};
			}

			${insertBlock(`step-checker-(${index})-before-indexing`)}

			${indexing}

			${insertBlock(`step-checker-(${index})-after`)}
			`,
		);
	}
}

import { Step } from ".";
import type { Response } from "@scripts/response";
import type { Description } from "@scripts/description";
import type { Checker, GetCheckerGeneric } from "@scripts/checker";
import type { Floor } from "@scripts/floor";
import { BuildedCheckerStep } from "./builded/checker";

export interface CheckerStepParams<
	CheckerGeneric extends GetCheckerGeneric = GetCheckerGeneric,
	Info extends string = string,
	Key extends string = string,
	CatchResponse extends Response = Response,
	FloorData extends object = object,
	Skip extends ((floor: any) => boolean) | undefined = ((floor: any) => boolean) | undefined,
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

export class CheckerStep<
	CurrentChecker extends Checker = Checker,
	_StepNumber extends number = number,
> extends Step<CurrentChecker, _StepNumber> {
	public params: CheckerStepParams;

	public constructor(
		checker: CurrentChecker,
		params: CheckerStepParams,
		descriptions: Description[] = [],
	) {
		super(checker, descriptions);
		this.params = params;
	}

	public build() {
		return new BuildedCheckerStep(this);
	}
}

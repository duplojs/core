import type { ExtractObject } from "@scripts/duplose";
import type { CurrentRequestObject } from "@scripts/request";
import type { Step } from "@scripts/step";
import type { PreflightStep } from "@scripts/step/preflight";
import { ProcessStep } from "@scripts/step/process";

export interface RouteBuilder<
	Request extends CurrentRequestObject = CurrentRequestObject,
	Preflights extends PreflightStep = PreflightStep,
	Extract extends ExtractObject = ExtractObject,
	Steps extends Step = Step,
	Floor extends object = object,
	ContractResponse extends Response = Response,
> {

}

export function createRoute() {

}

import type { CurrentRequestObject } from "@scripts/request";
import { Duplose, type ExtractObject } from ".";
import type { Step } from "@scripts/step";

export class Process<
	Request extends CurrentRequestObject = CurrentRequestObject,
	_Extract extends ExtractObject = ExtractObject,
	_Steps extends Step[] = [],
	_Floor extends object = object,
> extends Duplose<Request, _Extract, _Steps, _Floor> {
	public toString(): string {

	}
}

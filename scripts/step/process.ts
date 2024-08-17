import type { Description } from "@scripts/description";
import type { GetProcessGeneric, Process } from "@scripts/duplose/process";
import { Step } from ".";
import type { Floor } from "@scripts/floor";
import { insertBlock, maybeAwait, StringBuilder } from "@utils/stringBuilder";

export interface ProcessParamsStep<
	ProcessGeneric extends GetProcessGeneric = GetProcessGeneric,
	Pickup extends string = string,
	FloorData extends object = object,
	Skip extends (() => boolean) | undefined = undefined,
> {
	options?: Partial<ProcessGeneric["options"]> | ((pickup: Floor<FloorData>["pickup"]) => Partial<ProcessGeneric["options"]>);
	pickup?: ProcessGeneric["drop"] & Pickup[];
	input?(pickup: Floor<FloorData>["pickup"]): ProcessGeneric["input"];
	skip?: Skip;
}

export class ProcessStep extends Step<Process> {
	public params: ProcessParamsStep;

	public constructor(
		process: Process,
		params: ProcessParamsStep,
		descriptions: Description[] = [],
	) {
		super(process, descriptions);

		if (typeof params.options === "function") {
			const originalOptions = params.options;
			params.options = (pickup) => ({
				...process.options,
				...originalOptions(pickup),
			});
		} else if (params.options) {
			params.options = {
				...process.options,
				...params.options,
			};
		}

		this.params = params;
	}

	public toString(index: number): string {
		return /* js */`
		${insertBlock(`step-process-(${index})-before`)}

		${StringBuilder.result} = ${maybeAwait(asyc)}this.steps[${index}].processFunction(
			${StringBuilder.request},
			${!optionsIsFunction ? /* js */`this.steps[${index}].options` : /* js */`this.steps[${index}].options(floor.pickup)`},
			${hasInput ? /* js */`this.steps[${index}].input(floor.pickup)` : ""}
		);
		`;
	}
}

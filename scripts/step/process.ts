import type { Description } from "@scripts/description";
import type { GetProcessGeneric, Process } from "@scripts/duplose/process";
import { Step } from ".";
import type { Floor } from "@scripts/floor";
import { BuildedProcessStep } from "./builded/process";

export interface ProcessStepParams<
	ProcessGeneric extends GetProcessGeneric = GetProcessGeneric,
	Pickup extends string = string,
	FloorData extends object = object,
	Skip extends ((floor: any) => boolean) | undefined = ((floor: any) => boolean) | undefined,
> {
	options?: Partial<ProcessGeneric["options"]> | ((pickup: Floor<FloorData>["pickup"]) => Partial<ProcessGeneric["options"]>);
	pickup?: ProcessGeneric["drop"][] & Pickup[];
	input?(pickup: Floor<FloorData>["pickup"]): ProcessGeneric["input"];
	skip?: Skip;
}

export class ProcessStep<
	CurrentProcess extends Process = Process,
	_StepNumber extends number = number,
> extends Step<CurrentProcess, _StepNumber> {
	public params: ProcessStepParams;

	public constructor(
		process: CurrentProcess,
		params: ProcessStepParams = {},
		descriptions: Description[] = [],
	) {
		super(process, descriptions);
		this.params = params;
	}

	public build() {
		return new BuildedProcessStep(this);
	}
}

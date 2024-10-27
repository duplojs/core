import type { Description } from "@scripts/description";
import type { GetProcessGeneric, PresetGenericProcess } from "@scripts/duplose/process";
import { Step } from ".";
import type { Floor } from "@scripts/floor";
import { BuildedProcessStep } from "./builded/process";
import { type Duplo } from "@scripts/duplo";

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
	GenericProcess extends PresetGenericProcess = PresetGenericProcess,
	_GenericStepNumber extends number = number,
> extends Step<GenericProcess, _GenericStepNumber> {
	public params: ProcessStepParams;

	public constructor(
		process: GenericProcess,
		params: ProcessStepParams = {},
		descriptions: Description[] = [],
	) {
		super(process, descriptions);
		this.params = params;
	}

	public async build(instance: Duplo) {
		const processFunction = await this.parent.build();

		return new BuildedProcessStep(
			instance,
			this,
			processFunction,
		);
	}
}

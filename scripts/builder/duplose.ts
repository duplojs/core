import type { Process, GetProcessGeneric } from "@scripts/duplose/process";
import type { Floor } from "@scripts/floor";
import type { CurrentRequestObject } from "@scripts/request";
import { PreflightStep } from "@scripts/step/preflight";
import type { ProcessStepParams } from "@scripts/step/process";
import type { AddOne } from "@utils/incremente";

export interface Builder<
	Request extends CurrentRequestObject = CurrentRequestObject,
	Preflight extends PreflightStep = never,
	PreflightCount extends number = 0,
	FloorData extends object = object,
> {
	preflight<
		P extends Process,
		T extends string,
		F extends ((floor: Floor<FloorData>["pickup"]) => boolean) | undefined,
		GPG extends GetProcessGeneric<P> = GetProcessGeneric<P>,
	>(
		process: P,
		params?: ProcessStepParams<
			GPG,
			T,
			FloorData,
			F
		>,
	): Builder<
		Request,
		| Preflight
		| PreflightStep<P, PreflightCount>,
		AddOne<PreflightCount>,
		(
			T extends keyof GPG["floor"]
				? undefined extends F
					? Pick<GPG["floor"], T>
					: Partial<Pick<GPG["floor"], T>>
				: object
		) & (
			string extends T
				? FloorData
				: Omit<FloorData, T>
		)
	>;
}

export function useBuilder() {
	const preflight = (
		process: Process,
		params?: ProcessStepParams,
		preflights: PreflightStep[] = [],
	): ReturnType<Builder["preflight"]> => {
		const preflightStep = new PreflightStep(process, params);

		return {
			preflight: (arg1, arg2) => preflight(
				arg1 as Process,
				arg2 as ProcessStepParams,
				[...preflights, preflightStep],
			),
		};
	};

	return {
		preflight,
	} as Builder;
}

import { type Duplose } from "@scripts/duplose";

export function instanceofDuplose<
	GenericDuplose extends new(...args: any[]) => Duplose<any, any>,
>(
	constructor: GenericDuplose,
	duploseInstance: Duplose<any, any>,
): duploseInstance is InstanceType<GenericDuplose> {
	return duploseInstance instanceof constructor;
}

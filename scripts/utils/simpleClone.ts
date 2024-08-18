import { getTypedEntries } from "./getTypedEntries";

export function simpleClone<
	T extends unknown = unknown,
>(unknownValue: T): T {
	if (
		unknownValue
		&& typeof unknownValue === "object"
		&& (
			unknownValue.constructor?.name === "Object"
			|| unknownValue.constructor === undefined
		)

	) {
		return getTypedEntries(unknownValue).reduce(
			(pv, [key, value]) => {
				pv[key] = simpleClone(value);
				return pv;
			},
			{} as T,
		);
	} else if (unknownValue instanceof Array) {
		return unknownValue.map(simpleClone) as T;
	}

	return unknownValue;
}

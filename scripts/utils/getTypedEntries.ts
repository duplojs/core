export function getTypedEntries<
	O extends Object,
>(object: O) {
	return Object.entries(object) as {
		[P in keyof O]: [P, O[P]]
	}[keyof O][];
}

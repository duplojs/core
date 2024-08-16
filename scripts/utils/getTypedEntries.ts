export function getTypedEntries<
	O extends object,
>(object: O) {
	return Object.entries(object) as {
		[P in keyof O]: [P, O[P]]
	}[keyof O][];
}

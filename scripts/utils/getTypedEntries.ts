export function getTypedEntries<
	O extends object,
	T = {
		[P in keyof O]-?: O[P]
	},
>(object: O) {
	return Object.entries(object) as {
		[P in keyof T]: [P, T[P]]
	}[keyof T][];
}

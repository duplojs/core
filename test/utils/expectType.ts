export interface ExpectType<
	T extends any,
	A extends T,
	_R extends (
		boolean extends (
			T extends A
				? true
				: false
		)
			? never
			: "strict"
	),

> {
	A: A;
	T: T;
}

export interface ExpectType<
	T extends unknown,
	A extends unknown,
	_R extends (
		T extends A
			? A extends T
				? "strict"
				: never
			: never
	),

> {
	A: A;
	T: T;
}

export interface ExpectType<
	T extends unknown,
	A extends unknown,
	_R extends (
		(<V>() => V extends T ? 1 : 2) extends (<V>() => V extends A ? 1 : 2) ? "strict" : never
	),

> {
	A: A;
	T: T;
}

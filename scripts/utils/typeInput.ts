import type { AnyFunction, ObjectKey } from "./types";

export interface TypeInput<
	N extends ObjectKey = ObjectKey,
	V extends unknown = unknown,
> {
	inputName: N;
	value: V;
}

export type Inputer<
	T extends object = object,
> = {
	[P in keyof T]: (value: T[P]) => TypeInput<P, T[P]>
};

export type GetTypeInput<
	I extends Inputer,
	N extends keyof I = keyof I,
> = ReturnType<
	I[N] extends AnyFunction ? I[N] : never
>;

export function createTypeInput<T extends object>(): Inputer<T> {
	return new Proxy<
		Record<ObjectKey, AnyFunction>
	>(
		{},
		{
			get(target, name: string) {
				return (target[name] ||= (value) => ({
					inputName: name,
					value,
				} satisfies TypeInput));
			},
		},
	) as any;
}

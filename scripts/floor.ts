declare const unique: unique symbol;

export type DroppedValue<
	T extends Record<string, unknown> = Record<string, unknown>,
> = T & { [unique]: typeof unique };

export interface Floor<
	Data extends object = object,
> {
	pickup<Key extends keyof Data>(index: Key[]): { [P in Key]: Data[P] };
	pickup<Key extends keyof Data>(index: Key): Data[Key];
	drop<Key extends keyof Data>(index: Key, value: Data[Key]): void;
	dropper<
		T extends Record<string, unknown>,
	>(droppedValue: T): DroppedValue<T>;
}

export function makeFloor<
	Data extends object = object,
>(): Floor<Data> {
	const data = new Map();

	return {
		pickup: (index) => {
			if (index instanceof Array) {
				return index.reduce<Partial<Data>>(
					(pv, cv) => {
						pv[cv] = data.get(cv);
						return pv;
					},
					{},
				);
			} else {
				return data.get(index);
			}
		},
		drop: (index, value) => {
			data.set(index, value);
		},
		dropper: (values) => values as never,
	};
}

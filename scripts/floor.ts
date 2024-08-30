export interface Floor<
	Data extends object = object,
> {
	pickup<Key extends keyof Data>(index: Key[]): { [P in Key]: Data[P] };
	pickup<Key extends keyof Data>(index: Key): Data[Key];
	drop<Key extends keyof Data>(index: Key, value: Data[Key]): void;
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
	};
}

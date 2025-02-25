declare const unique: unique symbol;

export type UniqueObjectDroppedValue = {
	[unique]: typeof unique;
} & {};

export type DroppedValue<
	T extends Record<string, unknown> = Record<string, unknown>,
> = T & UniqueObjectDroppedValue;

export interface InjectFloorValues {

}

export type Floor<
	GenericValues extends object = object,
> = FloorMethods<GenericValues & InjectFloorValues>;

export interface FloorMethods<
	GenericValues extends object = object,
> {
	pickup<GenericKey extends keyof GenericValues>(index: GenericKey[]): { [P in GenericKey]: GenericValues[P] };
	pickup<GenericKey extends keyof GenericValues>(index: GenericKey): GenericValues[GenericKey];
	drop<GenericKey extends keyof GenericValues>(index: GenericKey, value: GenericValues[GenericKey]): void;
	dropper<
		T extends Record<string, unknown> | null,
	>(droppedValue: T): DroppedValue<T extends null ? {} : T>;
}

export function makeFloor<
	GenericValues extends object = object,
>(): Floor<GenericValues> {
	const data = new Map();

	return {
		pickup: (index) => {
			if (index instanceof Array) {
				return index.reduce<Partial<GenericValues & InjectFloorValues>>(
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
		dropper: (values) => (values === null ? {} : values) as never,
	};
}

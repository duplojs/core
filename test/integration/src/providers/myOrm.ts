import { getTypedEntries, hasKey } from "@duplojs/core";
import myDataBase from "./mydataBase.json";

export class MyOrm {
	public static find<
		T extends keyof typeof myDataBase,
	>(
		from: T,
		by?: Partial<typeof myDataBase[T][number]>,
	): Promise<typeof myDataBase[T][number][]> {
		return Promise.resolve(
			myDataBase[from].filter(
				(entity) => {
					if (!by) {
						return true;
					}

					return getTypedEntries(by)
						.every(
							([key, value]) => hasKey(entity, key) && entity[key] === value,
						);
				},
			),
		);
	}

	public static findOne<
		T extends keyof typeof myDataBase,
	>(
		from: T,
		by?: Partial<typeof myDataBase[T][number]>,
	): Promise<typeof myDataBase[T][number] | null> {
		return Promise.resolve(
			myDataBase[from].find(
				(entity) => {
					if (!by) {
						return true;
					}

					return getTypedEntries(by)
						.every(
							([key, value]) => hasKey(entity, key) && entity[key] === value,
						);
				},
			) ?? null,
		);
	}
}

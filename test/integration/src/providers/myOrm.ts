import { getTypedEntries, hasKey } from "@duplojs/utils";
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

	public static createOne<
		T extends keyof typeof myDataBase,
	>(
		from: T,
		data: typeof myDataBase[T][number],
	): Promise<boolean> {
		myDataBase[from].push(data as never);

		return Promise.resolve(true);
	}

	public static async updateOne<
		T extends keyof typeof myDataBase,
	>(
		from: T,
		by: Partial<typeof myDataBase[T][number]>,
		data: Partial<typeof myDataBase[T][number]>,
	): Promise<boolean> {
		const entity = await this.findOne(from, by);

		if (!entity) {
			return false;
		}

		getTypedEntries(data)
			.forEach(([key, value]) => {
				entity[key] = value as never;
			});

		return true;
	}
}

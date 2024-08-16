export class Floor<
	Data extends object = object,
> {
	private map = new Map();

	public pickup<Key extends keyof Data>(key: Key): Data[Key] {
		return this.map.get(key);
	}

	public drop<Key extends keyof Data>(key: Key, value: Data[Key]): void {
		this.map.set(key, value);
	}
}

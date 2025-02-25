const unique = Symbol("unique");

export abstract class Description {
	public readonly [unique] = unique;
}

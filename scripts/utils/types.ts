export type ObjectKey = keyof any;

export type ObjectEntry = [ObjectKey, any];

export type AnyFunction = (..._args: any) => any;

export type PromiseOrNot<T> = T | Promise<T>;

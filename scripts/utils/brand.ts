declare const unique: unique symbol;
export type Brand<T extends unknown> = T & { [unique]: typeof unique };

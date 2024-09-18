export type SimplifyType<T> = T extends Record<number, unknown> ? { [K in keyof T]: SimplifyType<T[K]> } : T;

import { zod } from "@duplojs/core";

export const entityUserSchema = zod.object({
	id: zod.number(),
	username: zod.string(),
	email: zod.string(),
	password: zod.string(),
	role: zod.string(),
	createdAt: zod.string(),
});

export const userSchema = entityUserSchema.pick({
	id: true,
	username: true,
	email: true,
	role: true,
	createdAt: true,
});

import { zod } from "@duplojs/core";

export const registeredUser = zod.object({
	id: zod.number(),
	username: zod.string(),
	email: zod.string(),
	password: zod.string(),
	role: zod.string(),
	createdAt: zod.string(),
});

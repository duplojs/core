import { zod } from "@duplojs/core";

export class Token {
	public static schema = zod.object({
		id: zod.number(),
		role: zod.string(),
	});
}

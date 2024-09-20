import { authorizationUserSchema } from "@domains/user/schemas";
import { createChecker } from "@duplojs/core";

export const decodeToken = createChecker("decodeToken")
	.handler(
		(input: string, output) => {
			const [validity, userRole, userId] = input.split("-");

			const { success, data } = authorizationUserSchema.safeParse({
				id: Number(userId),
				role: userRole,
			});
			if (
				validity === "valide"
				&& success
			) {
				return output("valide.token", data);
			} else {
				return output("invalide.token", null);
			}
		},
	);

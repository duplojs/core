import { createChecker } from "@duplojs/core";
import { Token } from "@src/services/token";

export const decodeToken = createChecker("decodeToken")
	.handler(
		(input: string, output) => {
			const [validity, userRole, userId] = input.split("-");

			const { success, data } = Token.schema.safeParse({
				id: Number(userId),
				role: userRole,
			});

			if (
				validity === "valide"
				&& success
			) {
				return output("valide.token", data);
			} else {
				return output("invalid.token", null);
			}
		},
	);

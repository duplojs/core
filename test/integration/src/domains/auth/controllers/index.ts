import { inputUserExist, userExist } from "@checkers/userExist";
import { ConflictHttpResponse, CreatedHttpResponse, makeResponseContract, useBuilder, zod } from "@duplojs/core";
import { MyOrm } from "@providers/myOrm";
import { registeredUser } from "../schemas/registeredUser";

export const registerUser = useBuilder()
	.createRoute("POST", "/users")
	.extract({
		body: zod.object({
			id: zod.number(),
			username: zod.string(),
			email: zod.string().email(),
			password: zod.string(),
			role: zod.string(),
			createdAt: zod.string(),
		}),
	})
	.check(
		userExist,
		{
			input: (pickup) => inputUserExist.email(pickup("body").email),
			result: "user.notfound",
			catch: () => new ConflictHttpResponse("emailAlreadyUse"),
		},
		makeResponseContract(ConflictHttpResponse, "emailAlreadyUse"),
	)
	.handler(
		async(pickup) => {
			const body = pickup("body");

			await MyOrm.createOne(
				"users",
				body,
			);

			return new CreatedHttpResponse("createdUser", body);
		},
		makeResponseContract(CreatedHttpResponse, "createdUser", registeredUser),
	);

import { inputUserExist, iWantUserExist, userExist } from "@checkers/user";
import { ConflictHttpResponse, CreatedHttpResponse, ForbiddenHttpResponse, makeResponseContract, OkHttpResponse, useBuilder, zod } from "@duplojs/core";
import { MyOrm } from "@providers/myOrm";
import { registeredUser } from "../schemas/registeredUser";
import type { ExpectType } from "@test/expectType";

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

export const loginUser = useBuilder()
	.createRoute("POST", "/login")
	.extract({
		body: zod.object({
			email: zod.string().email(),
			password: zod.string(),
		}),
	})
	.presetCheck(
		iWantUserExist
			.transformInput(inputUserExist.email)
			.redefineCatch(
				() => new ForbiddenHttpResponse("wrongUser"),
				makeResponseContract(ForbiddenHttpResponse, "wrongUser"),
			),
		(pickup) => pickup("body").email,
	)
	.cut(
		({ pickup, dropper }) => {
			const { user, body } = pickup(["user", "body"]);

			if (user.password !== body.password) {
				return new ForbiddenHttpResponse("wrongPassword");
			}

			type check = ExpectType<
				typeof user,
				{
					id: number;
					username: string;
					email: string;
					password: string;
					role: string;
					createdAt: string;
				},
				"strict"
			>;

			return dropper(null);
		},
		undefined,
		makeResponseContract(ForbiddenHttpResponse, "wrongPassword"),
	)
	.handler(
		(pickup) => {
			const { user } = pickup(["user"]);

			return new OkHttpResponse("loggedUser", `valide-${user.role}-${user.id}`);
		},
		makeResponseContract(OkHttpResponse, "loggedUser", zod.string()),
	);

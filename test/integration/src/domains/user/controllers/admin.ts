import { mustBeConnectedBuilder } from "@security/mustBeConnected";
import { makeResponseContract, OkHttpResponse, zod, zoderce } from "@duplojs/core";
import { iWantUserExist, iWantUserExistById } from "@checkers/user";
import { MyOrm } from "@providers/myOrm";
import { userSchema } from "../schemas";
import type { ExpectType } from "@test/expectType";

export const adminEditUser = mustBeConnectedBuilder({ role: "ADMIN" })
	.createRoute("PATCH", "/users/{userId}")
	.extract({
		params: {
			userId: zoderce.number().presetCheck(iWantUserExistById),
		},
		body: zod.object({
			username: zod.string(),
			role: zod.string(),
		}).partial(),
	})
	.handler(
		async(pickup) => {
			const { user: { password, ...user }, body, currentUser } = pickup(["user", "body", "currentUser"]);

			type check = ExpectType<
				typeof user,
				{
					id: number;
					username: string;
					email: string;
					role: string;
					createdAt: string;
				},
				"strict"
			>;
			type check1 = ExpectType<
				typeof currentUser,
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

			await MyOrm.updateOne(
				"users",
				{ id: user.id },
				body,
			);

			return new OkHttpResponse(
				"updatedUser",
				{
					...user,
					...body,
				},
			);
		},
		makeResponseContract(OkHttpResponse, "updatedUser", userSchema.strict()),
	);

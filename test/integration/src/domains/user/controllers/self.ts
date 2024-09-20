import { mustBeConnectedBuilder } from "@security/mustBeConnected";
import { makeResponseContract, OkHttpResponse } from "@duplojs/core";
import { userSchema } from "../schemas";
import type { ExpectType } from "@test/expectType";

export const getSelf = mustBeConnectedBuilder({ role: "USER" })
	.createRoute("GET", "/user")
	.handler(
		(pickup) => {
			const { user } = pickup(["user"]);

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

			return new OkHttpResponse("user", user);
		},
		makeResponseContract(OkHttpResponse, "user", userSchema),
	);

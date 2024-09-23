import { mustBeConnectedBuilder } from "@security/mustBeConnected";
import { makeResponseContract, OkHttpResponse } from "@duplojs/core";
import { userSchema } from "../schemas";
import type { ExpectType } from "@test/expectType";

export const getSelf = mustBeConnectedBuilder({ role: "USER" })
	.createRoute("GET", "/user")
	.handler(
		(pickup) => {
			const { currentUser } = pickup(["currentUser"]);

			type check = ExpectType<
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

			return new OkHttpResponse("user", currentUser);
		},
		makeResponseContract(OkHttpResponse, "user", userSchema),
	);

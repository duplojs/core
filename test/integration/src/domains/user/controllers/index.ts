import { mustBeConnectedBuilder } from "@security/mustBeConnected";
import { type File, makeResponseContract, OkHttpResponse, recieveFiles, zod } from "@duplojs/core";
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

export const uploadPicture = mustBeConnectedBuilder({ role: "USER" })
	.createRoute("PUT", "/user/picture")
	.extract({
		body: zod.receiveFormData({
			picture: recieveFiles({
				quantity: 1,
				maxSize: "5mb",
				mimeType: "image/png",
			}),
			pictureName: zod.string(),
		}),
	})
	.handler(
		(pickup) => {
			const { body } = pickup(["body"]);

			type check = ExpectType<
				typeof body,
				{
					pictureName: string;
					picture: File[];
				},
				"strict"
			>;

			return new OkHttpResponse("pictureUploded");
		},
		makeResponseContract(OkHttpResponse, "pictureUploded"),
	);

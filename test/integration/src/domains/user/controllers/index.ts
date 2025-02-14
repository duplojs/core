import { mustBeConnectedBuilder } from "@security/mustBeConnected";
import { File, makeResponseContract, recieveFiles, zod, OkHttpResponse, DownloadFileHttpResponse, Response, useBuilder } from "@duplojs/core";
import { userSchema } from "../schemas";
import { type ExpectType } from "@duplojs/utils";

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

export const getPicture = mustBeConnectedBuilder({ role: "USER" })
	.createRoute("GET", "/user/picture")
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

			return new DownloadFileHttpResponse(
				"sendPicture",
				new File("/picture.png"),
			);
		},
		makeResponseContract(DownloadFileHttpResponse, "sendPicture", zod.instanceof(File)),
	);

export const makeErrorContractRoute = useBuilder()
	.createRoute("GET", "/make-error-contract")
	.extract({
		query: {
			code: zod.coerce.number(),
			information: zod.string(),
			body: zod.any(),
		},
	})
	.handler(
		(pickup) => {
			const { body, code, information } = pickup(["body", "code", "information"]);

			return new Response(<any>code, <any>information, body);
		},
		makeResponseContract(OkHttpResponse, "maSuperInformation"),
	);

import { decodeToken } from "@checkers/token";
import { inputUserExist, iWantUserExist } from "@checkers/user";
import { useBuilder, zod, UnauthorizedHttpResponse, makeResponseContract } from "@duplojs/core";
import { type ExpectType } from "@duplojs/utils";

interface MustBeConnectedOptions {
	role: string;
}

export const mustBeConnected = useBuilder()
	.createProcess(
		"mustBeConnected",
		{
			options: <MustBeConnectedOptions>{
				role: "USER",
			},
		},
	)
	.extract(
		{
			headers: {
				authorization: zod.string(),
			},
		},
		() => new UnauthorizedHttpResponse("missingAuthorization"),
	)
	.check(
		decodeToken,
		{
			input: (pickup) => {
				const { authorization } = pickup(["authorization"]);
				type check = ExpectType<typeof authorization, string, "strict">;
				return authorization;
			},
			result: "valide.token",
			catch: () => new UnauthorizedHttpResponse("invalidAuthorization"),
			indexing: "tokenData",
		},
		makeResponseContract(UnauthorizedHttpResponse, "invalidAuthorization"),
	)
	.presetCheck(
		iWantUserExist.rewriteIndexing("currentUser"),
		(pickup) => inputUserExist.id(pickup("tokenData").id),
	)
	.cut(
		({ pickup, dropper }) => {
			const { tokenData, options, currentUser } = pickup(["tokenData", "options", "currentUser"]);

			type check = ExpectType<
				typeof tokenData,
				{
					role: string;
					id: number;
				},
				"strict"
			>;

			type check1 = ExpectType<typeof options, MustBeConnectedOptions, "strict">;

			type check2 = ExpectType<
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

			if (currentUser.role === "ADMIN") {
				return dropper(null);
			}

			if (currentUser.role !== options.role) {
				return new UnauthorizedHttpResponse("wrongRole");
			}

			return dropper(null);
		},
		[],
		makeResponseContract(UnauthorizedHttpResponse, "wrongRole"),
	)
	.exportation(["tokenData", "currentUser"]);

export function mustBeConnectedBuilder(options: MustBeConnectedOptions) {
	return useBuilder()
		.preflight(
			mustBeConnected,
			{
				options,
				pickup: ["currentUser"],
			},
		);
}

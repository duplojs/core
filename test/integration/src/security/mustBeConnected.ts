import { decodeToken } from "@checkers/token";
import { inputUserExist, iWantUserExist } from "@checkers/userExist";
import { useBuilder, zod, UnauthorizedHttpResponse, makeResponseContract } from "@duplojs/core";
import type { ExpectType } from "@test/expectType";

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
			catch: () => new UnauthorizedHttpResponse("invalideAuthorization"),
			indexing: "tokenData",
		},
		makeResponseContract(UnauthorizedHttpResponse, "invalideAuthorization"),
	)
	.presetCheck(
		iWantUserExist,
		(pickup) => inputUserExist.id(pickup("tokenData").id),
	)
	.cut(
		({ pickup, dropper }) => {
			const { tokenData, options, user } = pickup(["tokenData", "options", "user"]);

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

			if (user.role === "ADMIN") {
				return dropper({});
			}

			if (user.role !== options.role) {
				return new UnauthorizedHttpResponse("wrongRole");
			}

			return dropper({});
		},
		[],
		makeResponseContract(UnauthorizedHttpResponse, "wrongRole"),
	)
	.exportation(["tokenData", "user"]);

export function mustBeConnectedBuilder(options: MustBeConnectedOptions) {
	return useBuilder()
		.preflight(
			mustBeConnected,
			{
				options,
				pickup: ["user"],
			},
		);
}

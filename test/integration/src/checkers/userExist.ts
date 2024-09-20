import { createChecker, createPresetChecker, createTypeInput, makeResponseContract, NotFoundHttpResponse, type GetTypeInput } from "@duplojs/core";
import { MyOrm } from "@providers/myOrm";

export const inputUserExist = createTypeInput<{
	id: number;
	email: string;
}>();

export const userExist = createChecker("userExist")
	.handler(
		async({ inputName, value }: GetTypeInput<typeof inputUserExist>, output) => {
			let query: undefined | Parameters<typeof MyOrm.findOne>[1] = undefined;

			if (inputName === "email") {
				query = { email: value };
			} else {
				query = { id: value };
			}

			const user = await MyOrm.findOne("users", query);

			if (user) {
				return output("user.exist", user);
			} else {
				return output("user.notfound", user);
			}
		},
	);

export const iWantUserExist = createPresetChecker(
	userExist,
	{
		result: "user.exist",
		indexing: "user",
		catch: () => new NotFoundHttpResponse("notfoundUser"),
	},
	makeResponseContract(NotFoundHttpResponse, "notfoundUser"),
);

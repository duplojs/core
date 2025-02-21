import { OkHttpResponse, UnauthorizedHttpResponse, useBuilder } from "@duplojs/core";
import { duplo } from "@src/main";
import { adminEditUser } from "./admin";
import { makeFakeRequest } from "@test/request";

describe("adminEditUser", async() => {
	duplo.register(...useBuilder.getAllCreatedDuplose());

	const buildedRoute = await adminEditUser.build();

	it("invalide role", async() => {
		const result = await buildedRoute(
			makeFakeRequest({
				headers: { authorization: "invalidAuthorization" },
				params: { userId: "10" },
				body: {
					username: "toto",
				},
			}),
		);

		expect(result).instanceof(UnauthorizedHttpResponse);
		expect(result.information).toBe("invalidAuthorization");
	});

	it("edit user", async() => {
		const result = await buildedRoute(
			makeFakeRequest({
				headers: { authorization: "valide-ADMIN-9" },
				params: { userId: "10" },
				body: {
					username: "toto",
				},
			}),
		);

		expect(result).instanceof(OkHttpResponse);
		expect(result.information).toBe("updatedUser");
	});
});

import { NotFoundHttpResponse, OkHttpResponse, UnprocessableEntityHttpResponse, useBuilder } from "@duplojs/core";
import { duplo } from "@src/main";
import { adminEditUser } from "./admin";
import { makeFakeRequest } from "@test/request";

describe("adminEditUser", async() => {
	duplo.register(...useBuilder.getAllCreatedDuplose());

	const buildedRoute = await adminEditUser.build();

	it("presetCheck in extract", async() => {
		const result = await buildedRoute(
			makeFakeRequest({
				headers: { authorization: "valide-ADMIN-9" },
				params: { userId: "tt" },
			}),
		);

		expect(result).instanceof(UnprocessableEntityHttpResponse);
		expect(result.information).toBe("TYPE_ERROR.params.userId");
	});

	it("presetCheck in extract", async() => {
		const result = await buildedRoute(
			makeFakeRequest({
				headers: { authorization: "valide-ADMIN-9" },
				params: { userId: "30" },
			}),
		);

		expect(result).instanceof(NotFoundHttpResponse);
		expect(result.information).toBe("notfoundUser");
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

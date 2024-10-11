import { duplo } from "@src/main";
import { mustBeConnected } from "./mustBeConnected";
import { makeFakeRequest } from "@test/request";
import { NotFoundHttpResponse, UnauthorizedHttpResponse } from "@duplojs/core";

describe("mustBeConnected", async() => {
	duplo.register(mustBeConnected);

	const builedProcess = await mustBeConnected.build();

	it("missing Authorization", async() => {
		const result = await builedProcess(
			makeFakeRequest(),
			{ role: "USER" },
			undefined,
		) as UnauthorizedHttpResponse;

		expect(result).instanceOf(UnauthorizedHttpResponse);
		expect(result.information).toBe("missingAuthorization");
	});

	it("invalid Authorization", async() => {
		const result = await builedProcess(
			makeFakeRequest({ headers: { authorization: "invalidAuthorization" } }),
			{ role: "USER" },
			undefined,
		) as UnauthorizedHttpResponse;

		expect(result).instanceOf(UnauthorizedHttpResponse);
		expect(result.information).toBe("invalidAuthorization");
	});

	it("notfound user", async() => {
		const result = await builedProcess(
			makeFakeRequest({ headers: { authorization: "valide-USER-20" } }),
			{ role: "USER" },
			undefined,
		) as NotFoundHttpResponse;

		expect(result).instanceOf(NotFoundHttpResponse);
		expect(result.information).toBe("notfoundUser");
	});

	it("notfound user", async() => {
		const result = await builedProcess(
			makeFakeRequest({ headers: { authorization: "valide-USER-20" } }),
			{ role: "USER" },
			undefined,
		) as NotFoundHttpResponse;

		expect(result).instanceOf(NotFoundHttpResponse);
		expect(result.information).toBe("notfoundUser");
	});

	it("wrong role", async() => {
		const result = await builedProcess(
			makeFakeRequest({ headers: { authorization: "valide-USER-1" } }),
			{ role: "ADMIN" },
			undefined,
		) as UnauthorizedHttpResponse;

		expect(result).instanceOf(UnauthorizedHttpResponse);
		expect(result.information).toBe("wrongRole");
	});

	it("passe", async() => {
		const result = await builedProcess(
			makeFakeRequest({ headers: { authorization: "valide-ADMIN-9" } }),
			{ role: "ADMIN" },
			undefined,
		);

		expect(result).toStrictEqual({
			tokenData: {
				id: 9,
				role: "ADMIN",
			},
			currentUser: {
				createdAt: "2023-09-18T15:00:00Z",
				email: "elon@example.com",
				id: 9,
				password: "hashed_password_333",
				role: "ADMIN",
				username: "elon_musk",
			},
		});
	});
});

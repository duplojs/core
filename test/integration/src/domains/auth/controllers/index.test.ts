import { duplo } from "@src/main";
import { loginUser, registerUser } from ".";
import { makeFakeRequest } from "@test/request";
import { ForbiddenHttpResponse, OkHttpResponse } from "@duplojs/core";

describe("register", () => {
	duplo.register(registerUser);
	const builedRoute = registerUser.build();

	it("email already use", async() => {
		const result = await builedRoute(
			makeFakeRequest({
				body: {
					id: 55,
					username: "mathcovax",
					email: "john@example.com",
					password: "monSuperPassword",
					role: "ADMIN",
					createdAt: "2040-09-21",
				},
			}),
		);

		expect(result.information).toBe("emailAlreadyUse");
	});

	it("created user", async() => {
		const result = await builedRoute(
			makeFakeRequest({
				body: {
					id: 55,
					username: "mathcovax",
					email: "campani.mathieu@gmail.com",
					password: "monSuperPassword",
					role: "ADMIN",
					createdAt: "2040-09-21",
				},
			}),
		);

		expect(result.information).toBe("createdUser");
	});
});

describe("login", () => {
	duplo.register(loginUser);
	const builedRoute = loginUser.build();

	it("wrong password", async() => {
		const result = await builedRoute(
			makeFakeRequest({
				body: {
					email: "elon@example.com",
					password: "toto",
				},
			}),
		);

		expect(result).instanceof(ForbiddenHttpResponse);
		expect(result.information).toBe("wrongPassword");
	});

	it("user logged", async() => {
		const result = await builedRoute(
			makeFakeRequest({
				body: {
					email: "elon@example.com",
					password: "hashed_password_333",
				},
			}),
		);

		expect(result).instanceof(OkHttpResponse);
		expect(result.information).toBe("loggedUser");
		expect(result.body).toBe("valide-ADMIN-9");
	});
});

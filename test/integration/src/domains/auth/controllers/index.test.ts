import { duplo } from "@src/main";
import { loginUser, registerUser } from ".";
import { makeFakeRequest } from "@test/request";
import { ForbiddenHttpResponse, OkHttpResponse } from "@duplojs/core";

describe("register", async() => {
	duplo.register(registerUser);
	const buildedRoute = await registerUser.build();

	it("email already use", async() => {
		const result = await buildedRoute(
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
		const result = await buildedRoute(
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

describe("login", async() => {
	duplo.register(loginUser);
	const buildedRoute = await loginUser.build();

	it("wrong password", async() => {
		const result = await buildedRoute(
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
		const result = await buildedRoute(
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

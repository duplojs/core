import { duplo } from "@src/main";
import { registerUser } from ".";
import { makeFakeRequest } from "@test/request";

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

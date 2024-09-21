import { duplo } from "@src/main";
import { getSelf } from ".";
import { makeFakeRequest } from "@test/request";
import { OkHttpResponse, useBuilder } from "@duplojs/core";

describe("self", () => {
	duplo.register(...useBuilder.getAllCreatedDuplose());
	const builedRoute = getSelf.build();

	it("getSelf", async() => {
		const result = await builedRoute(
			makeFakeRequest({ headers: { authorization: "valide-USER-1" } }),
		) as OkHttpResponse;

		expect(result).instanceof(OkHttpResponse);
		expect(result.information).toBe("user");
	});
});

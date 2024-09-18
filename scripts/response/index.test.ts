import type { ExpectType } from "@test/utils/expectType";
import { Response } from ".";

describe("response", () => {
	it("construct response", () => {
		const response = new Response(555, "toto", { test: 1 });

		type check = ExpectType<
			typeof response extends Response<infer Code, infer Informationt, infer Body>
				? [Code, Informationt, Body]
				: never,
			[555, "toto", { test: number }],
			"strict"
		>;
	});

	it("use headers methods", () => {
		const response = new Response(555, "toto", { test: 1 });

		response.setHeaders({
			token: "azerty",
			"content-type": "html/text",
		});

		expect(response.headers).toStrictEqual({
			token: "azerty",
			"content-type": "html/text",
		});

		response.deleteHeaders(["token"]);

		expect(response.headers).toStrictEqual({ "content-type": "html/text" });

		response.setHeader("content-type", undefined);

		expect(response.headers).toStrictEqual({});

		response.deleteHeader("content-type");
	});
});

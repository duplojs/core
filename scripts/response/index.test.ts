import { type ExpectType } from "@duplojs/utils";
import { makeResponseContract, Response } from ".";
import { BadRequestHttpResponse } from "./simplePreset";
import { zod, type ZodSpace } from "@scripts/parser";

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

	it("makeResponseContract", () => {
		const contract1 = makeResponseContract(BadRequestHttpResponse);

		type check1 = ExpectType<
			typeof contract1,
			[Response<400, string | undefined, ZodSpace.ZodUndefined>],
			"strict"
		>;

		expect(contract1[0].code).toBe(400);
		expect(contract1[0].information).toBe(undefined);
		expect(contract1[0].body).instanceof(zod.ZodUndefined);

		const contract2 = makeResponseContract(BadRequestHttpResponse, ["superInfo1", "superInfo2"]);

		type check2 = ExpectType<
			typeof contract2,
			[
				Response<400, "superInfo1", ZodSpace.ZodUndefined>,
				Response<400, "superInfo2", ZodSpace.ZodUndefined>,
			],
			"strict"
		>;

		expect(contract2[0].information).toBe("superInfo1");
		expect(contract2[1].information).toBe("superInfo2");

		const contract3 = makeResponseContract(BadRequestHttpResponse, "toto", zod.string());

		type check3 = ExpectType<
			typeof contract3,
			[Response<400, "toto", ZodSpace.ZodString>],
			"strict"
		>;

		expect(contract3[0].information).toBe("toto");
		expect(contract3[0].body).instanceof(zod.ZodString);
	});
});

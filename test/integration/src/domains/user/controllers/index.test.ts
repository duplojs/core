import { duplo } from "@src/main";
import { getSelf, uploadPicture } from ".";
import { makeFakeRequest } from "@test/request";
import { OkHttpResponse, ReceiveFormData, ReceiveFormDataIssue, UnprocessableEntityHttpResponse, useBuilder, File } from "@duplojs/core";
import { promise, type ZodError } from "zod";

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

describe("uploadPicture", () => {
	duplo.register(...useBuilder.getAllCreatedDuplose());
	uploadPicture.hooks.onError.addSubscriber(
		(request, error) => {
			throw error;
		},
	);
	const builedRoute = uploadPicture.build();

	it("Receive Form Data Issue", async() => {
		const result = await builedRoute(
			makeFakeRequest({
				headers: { authorization: "valide-USER-1" },
				body: new ReceiveFormData(
					(params) => {
						expect(params).toStrictEqual({
							fields: ["pictureName"],
							files: {
								picture: {
									maxQuantity: 1,
									maxSize: 5242880,
									mimeType: ["image/png"],
								},
							},
						});
						return Promise.resolve(new ReceiveFormDataIssue("file", "picture", "sizeExceeds"));
					},
				),
			}),
		);

		expect(result).instanceOf(UnprocessableEntityHttpResponse);
		expect(result.information).toBe("TYPE_ERROR.body");
		expect((result.body as ZodError).issues?.[0].message).toBe("picture : file sizeExceeds");
	});

	it("invalid content", async() => {
		const result = await builedRoute(
			makeFakeRequest({
				headers: { authorization: "valide-USER-1" },
				body: new ReceiveFormData(
					(params) => Promise.resolve({
						picture: [],
						pictureName: "test",
					}),
				),
			}),
		);

		expect(result).instanceOf(UnprocessableEntityHttpResponse);
		expect(result.information).toBe("TYPE_ERROR.body");
		expect((result.body as ZodError).issues?.[0].message).toBe(".picture : Input Array has length less than 1.");
	});

	it("upload picture", async() => {
		const result = await builedRoute(
			makeFakeRequest({
				headers: { authorization: "valide-USER-1" },
				body: new ReceiveFormData(
					(params) => Promise.resolve({
						picture: [new File("/test.png")],
						pictureName: "test",
					}),
				),
			}),
		);

		expect(result).instanceOf(OkHttpResponse);
		expect(result.information).toBe("pictureUploded");
	});
});

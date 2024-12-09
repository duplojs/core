import { duplo } from "@src/main";
import { getPicture, getSelf, makeErrorContractRoute, uploadPicture } from ".";
import { makeFakeRequest } from "@test/request";
import {
	OkHttpResponse,
	ReceiveFormData,
	ReceiveFormDataIssue,
	UnprocessableEntityHttpResponse,
	useBuilder,
	File,
	DownloadFileHttpResponse,
	Response,
	type PresetGenericResponse,
	ContractResponseError,
	ZodAcceleratorError,
} from "@duplojs/core";
import { type ZodError } from "zod";

describe("getSelf", async() => {
	duplo.register(...useBuilder.getAllCreatedDuplose());
	const buildedRoute = await getSelf.build();

	it("getSelf", async() => {
		const result = await buildedRoute(
			makeFakeRequest({ headers: { authorization: "valide-USER-1" } }),
		) as OkHttpResponse;

		expect(result).instanceof(OkHttpResponse);
		expect(result.information).toBe("user");
	});
});

describe("uploadPicture", async() => {
	duplo.register(...useBuilder.getAllCreatedDuplose());
	uploadPicture.hooks.onError.addSubscriber(
		(request, error) => {
			throw error;
		},
	);
	const buildedRoute = await uploadPicture.build();

	it("Receive Form Data Issue", async() => {
		const result = await buildedRoute(
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
									mimeTypes: [/^image\/png$/],
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
		const result = await buildedRoute(
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
		const result = await buildedRoute(
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

describe("getPicture", async() => {
	duplo.register(...useBuilder.getAllCreatedDuplose());
	getPicture.hooks.onError.addSubscriber(
		(request, error) => {
			throw error;
		},
	);
	const buildedRoute = await getPicture.build();

	it("getPicture", async() => {
		const result = await buildedRoute(
			makeFakeRequest({ headers: { authorization: "valide-USER-1" } }),
		) as DownloadFileHttpResponse;

		expect(result).instanceOf(DownloadFileHttpResponse);
		expect(result.information).toBe("sendPicture");
	});
});

describe("Error Contract Route", async() => {
	duplo.register(...useBuilder.getAllCreatedDuplose());
	const buildedRoute = await makeErrorContractRoute.build();

	it("no error", async() => {
		const result = await buildedRoute(
			makeFakeRequest({
				query: {
					code: "200",
					information: "maSuperInformation",
					body: undefined,
				},
			}),
		) as PresetGenericResponse;

		expect(result).instanceOf(Response);
		expect(result.code).toBe(200);
		expect(result.information).toBe("maSuperInformation");
		expect(result.body).toBe(undefined);
	});

	it("error code", async() => {
		const result = await buildedRoute(
			makeFakeRequest({
				query: {
					code: "300",
					information: "maSuperInformation",
					body: undefined,
				},
			}),
		) as PresetGenericResponse;

		expect(result).instanceOf(Response);
		expect(result.code).toBe(503);
		expect(result.information).toBe("WRONG_RESPONSE_CONTRACT");
		expect(result.body).toMatchObject({
			zodError: new ZodAcceleratorError(".", "Input has no correspondence in union."),
		});
	});

	it("error information", async() => {
		const result = await buildedRoute(
			makeFakeRequest({
				query: {
					code: "200",
					information: "toto",
					body: undefined,
				},
			}),
		) as PresetGenericResponse;

		expect(result).instanceOf(Response);
		expect(result.code).toBe(503);
		expect(result.information).toBe("WRONG_RESPONSE_CONTRACT");
		expect(result.body).toMatchObject({
			zodError: new ZodAcceleratorError(".", "Input has no correspondence in union."),
		});
	});

	it("error body", async() => {
		const result = await buildedRoute(
			makeFakeRequest({
				query: {
					code: "200",
					information: "maSuperInformation",
					body: "undefined",
				},
			}),
		) as PresetGenericResponse;

		expect(result).instanceOf(Response);
		expect(result.code).toBe(503);
		expect(result.information).toBe("WRONG_RESPONSE_CONTRACT");
		expect(result.body).toMatchObject({
			zodError: new ZodAcceleratorError(".", "Input has no correspondence in union."),
		});
	});
});

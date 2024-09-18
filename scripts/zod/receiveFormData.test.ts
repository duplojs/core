import { zod } from ".";
import { receiveFormData, ReceiveFormData, ReceiveFormDataIssue } from "./receiveFormData";
import { File } from "@utils/file";

describe("receiveFormData", () => {
	const zodSchema = receiveFormData({
		files: {
			logo: {
				quantity: 1,
				maxSize: "4mb",
				mimeType: "image/png",
			},
		},
		fields: {
			prop1: zod.string(),
			prop2: zod.number(),
		},
	});

	it("pass schema", async() => {
		const rfd = new ReceiveFormData(
			(params) => {
				expect(params).toStrictEqual({
					fields: ["prop1", "prop2"],
					files: {
						logo: {
							maxQuantity: 1,
							maxSize: 4194304,
							mimeType: ["image/png"],
						},
					},
				});

				return Promise.resolve({
					logo: [new File("test.png")],
					prop1: "tt",
					prop2: 2,
				});
			},
		);

		const result = await zodSchema.parseAsync(rfd);

		expect(result).toStrictEqual({
			logo: [new File("test.png")],
			prop1: "tt",
			prop2: 2,
		});
	});

	it("receive error", async() => {
		const rfd = new ReceiveFormData(
			() => Promise.resolve(new ReceiveFormDataIssue("file", "prop1", "qauntityExceeds")),
		);

		const result = await zodSchema.safeParseAsync(rfd);

		expect(result.error?.issues).toStrictEqual([
			{
				code: "custom",
				message: "prop1 : file qauntityExceeds",
				params: {
					receiveFormDataIssue: new ReceiveFormDataIssue(
						"file",
						"prop1",
						"qauntityExceeds",
					),
				},
				path: ["prop1"],
			},
		]);
	});
});

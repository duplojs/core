import { zod } from ".";
import { receiveFormData, ReceiveFormData, ReceiveFormDataIssue, recieveFiles, zodSchemaHasReceiveFormData } from "./receiveFormData";
import { File } from "@utils/file";
import { zodSchemaIsAsync } from "@duplojs/zod-accelerator";
import { type ExpectType } from "@duplojs/utils";

describe("receiveFormData", () => {
	const zodSchema = receiveFormData({
		logo: recieveFiles({
			quantity: 1,
			maxSize: "4mb",
			mimeType: "image/png",
		}),
		prop1: zod.string(),
		prop2: zod.coerce.number(),
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
							mimeTypes: [/^image\/png$/],
						},
					},
				});

				return Promise.resolve({
					logo: [new File("test.png")],
					prop1: "tt",
					prop2: "2",
				});
			},
		);

		const result = await zodSchema.parseAsync(rfd);

		expect(result).toStrictEqual({
			logo: [new File("test.png")],
			prop1: "tt",
			prop2: 2,
		});

		type check = ExpectType<
			typeof result,
			{
				logo: File[];
				prop1: string;
				prop2: number;
			},
			"strict"
		>;
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

	it("reject error", async() => {
		const rfd = new ReceiveFormData(
			() => Promise.reject(new Error()),
		);

		await expect(() => zodSchema.safeParseAsync(rfd)).rejects.toThrow(Error);
	});

	it("zodSchemaHasReceiveFormData", () => {
		expect(zodSchemaIsAsync(zodSchema)).toBe(true);

		expect(zodSchemaHasReceiveFormData(zodSchema)).toBe(true);
	});
});

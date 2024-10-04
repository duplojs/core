import { ZodType, z as zod } from "zod";
import { File } from "@utils/file";
import { stringToBytes, type BytesInString } from "@utils/stringToBytes";
import type { SimplifyType } from "@utils/simplifyType";

export interface RecieveFormDataOptions {
	uploadDirectory?: string;
	prefixTempName?: string;
	strict?: boolean;
}

export interface RecieveFormDataFileParams {
	quantity: number | [number, number];
	maxSize: number | BytesInString;
	mimeType: string | string[];
}

export class ReceiveFile {
	public constructor(
		public params: RecieveFormDataFileParams,
	) {}
}

export function recieveFiles(
	params: RecieveFormDataFileParams,
) {
	return new ReceiveFile(params);
}

export type RecieveFormDataParams = Record<string, ZodType | ReceiveFile>;

export type ReceiveFormDataTypeIssue = "file" | "field";

export type ReceiveFormDataCauseIssue = "sizeExceeds" | "qauntityExceeds" | "wrongMimeType" | "tooMutch";

export class ReceiveFormDataIssue extends Error {
	public constructor(
		public type: ReceiveFormDataTypeIssue,
		public key: string,
		public cause: ReceiveFormDataCauseIssue,
	) {
		super(`${key} : ${type} ${cause}`);
	}
}

export interface ReceiveFormDataExtractorFileParams {
	maxQuantity: number;
	maxSize: number;
	mimeTypes: string[];
}

export interface ReceiveFormDataExtractorParams extends RecieveFormDataOptions {
	fields?: string[];
	files?: Record<string, ReceiveFormDataExtractorFileParams>;
}

export type ReceiveFormDataExtractor =
	(params: ReceiveFormDataExtractorParams) => Promise<
		Record<string, unknown> | ReceiveFormDataIssue
	>;

export class ReceiveFormData {
	public constructor(
		public extractor: ReceiveFormDataExtractor,
	) {}
}

export type TransformRecieveFormDataParams<
	T extends RecieveFormDataParams,
> = {
	[P in keyof T]: T[P] extends ZodType ? T[P]["_output"] : File[]
};

export function receiveFormData<
	T extends RecieveFormDataParams,
>(params: T, options: RecieveFormDataOptions = {}) {
	const zodSchemaPostExtract = zod.object(
		Object.entries(params)
			.reduce<Record<string, ZodType>>(
				(pv, [key, value]) => {
					if (value instanceof ReceiveFile) {
						const filesParams = value.params;
						pv[key] = zod
							.instanceof(File)
							.array()
							.min(
								filesParams.quantity instanceof Array
									? filesParams.quantity[0]
									: filesParams.quantity,
							);
					} else {
						pv[key] = value;
					}

					return pv;
				},
				{},
			),
	);

	const extractorReceiveFilesParams
		= Object.entries(params)
			.filter((entry): entry is [string, ReceiveFile] => entry[1] instanceof ReceiveFile);

	const extractorFieldsParams
			= Object.entries(params)
				.filter(([_key, value]) => value instanceof ZodType)
				.map(([key]) => key);

	const extractorParams: ReceiveFormDataExtractorParams = {
		...options,
		fields: extractorFieldsParams.length
			? extractorFieldsParams
			: undefined,
		files: extractorReceiveFilesParams.length
			? extractorReceiveFilesParams
				.reduce<Record<string, ReceiveFormDataExtractorFileParams>>(
					(pv, [key, value]) => {
						const filesParams = value.params;

						pv[key] = {
							maxQuantity: filesParams.quantity instanceof Array
								? filesParams.quantity[1]
								: filesParams.quantity,
							maxSize: typeof filesParams.maxSize === "string"
								? stringToBytes(filesParams.maxSize)
								: filesParams.maxSize,
							mimeTypes: filesParams.mimeType instanceof Array
								? filesParams.mimeType
								: [filesParams.mimeType],
						};

						return pv;
					},
					{},
				)
			: undefined,
	};

	return zod
		.instanceof(ReceiveFormData)
		.transform(async(value, ctx) => {
			const result = await value.extractor(extractorParams);

			if (result instanceof ReceiveFormDataIssue) {
				ctx.addIssue({
					code: "custom",
					message: result.message,
					params: {
						receiveFormDataIssue: result,
					},
					path: [result.key],
				});

				return zod.NEVER;
			}

			return result;
		})
		.pipe(zodSchemaPostExtract) as
		ZodType<
			SimplifyType<TransformRecieveFormDataParams<T>>,
			any,
			ReceiveFormData
		>;
}


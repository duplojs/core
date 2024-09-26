import { type ZodType, type infer as ZodInfer, z as zod } from "zod";
import { File } from "@utils/file";
import { getTypedKeys } from "@utils/getTypedKeys";
import { stringToBytes, type BytesInString } from "@utils/stringToBytes";
import { getTypedEntries } from "@utils/getTypedEntries";
import type { SimplifyType } from "@utils/simplifyType";

export interface MultipartFormDataFileParams {
	quantity: number | [number, number];
	maxSize: number | BytesInString;
	mimeType: string | string[];
}

export interface MultipartFormDataParams<
	T extends object = MultipartFormDataFileParams,
> {
	fields?: Record<string, ZodType>;
	files?: Record<string, T>;
	strict?: boolean;
}

export type ReceiveFormDataTypeIssue = "file" | "field";

export type ReceiveFormDataCauseIssue = "sizeExceeds" | "qauntityExceeds" | "wrongMimeType" | "tooMutch";

export class ReceiveFormDataIssue {
	public constructor(
		public type: ReceiveFormDataTypeIssue,
		public key: string,
		public cause: ReceiveFormDataCauseIssue,
	) {}
}

export interface ReceiveFormDataExtractorFileParams {
	maxQuantity: number;
	maxSize: number;
	mimeType: string[];
}

export interface ReceiveFormDataExtractorParams {
	fields?: string[];
	files?: Record<string, ReceiveFormDataExtractorFileParams>;
	strict?: boolean;
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

export type TransformMultipartFormDataParams<
	T extends MultipartFormDataParams,
> = {
	[P in Exclude<keyof T["fields"], keyof T["files"]>]: T["fields"][P] extends ZodType ? ZodInfer<T["fields"][P]> : never
} & {
	[P in keyof T["files"]]: File[]
};

export function receiveFormData<
	T extends MultipartFormDataParams,
>(params: T) {
	const zodSchemaPostExtract = zod.object({
		...params.fields,
		...getTypedEntries(params.files ?? {})
			.reduce<Record<string, ZodType>>(
				(pv, [key, value]) => {
					pv[key] = zod
						.instanceof(File)
						.array()
						.min(
							value.quantity instanceof Array
								? value.quantity[0]
								: value.quantity,
						);
					return pv;
				},
				{},
			),
	});

	const extractorParams: ReceiveFormDataExtractorParams = {
		...params,
		fields: getTypedKeys(params.fields ?? {}),
		files: getTypedEntries(params.files ?? {})
			.reduce<Record<string, ReceiveFormDataExtractorFileParams>>(
				(pv, [key, value]) => {
					pv[key] = {
						maxQuantity: value.quantity instanceof Array
							? value.quantity[1]
							: value.quantity,
						maxSize: typeof value.maxSize === "string"
							? stringToBytes(value.maxSize)
							: value.maxSize,
						mimeType: value.mimeType instanceof Array
							? value.mimeType
							: [value.mimeType],
					};

					return pv;
				},
				{},
			),
	};

	return zod
		.instanceof(ReceiveFormData)
		.transform(async(value, ctx) => {
			const result = await value.extractor(extractorParams);

			if (result instanceof ReceiveFormDataIssue) {
				ctx.addIssue({
					code: "custom",
					message: `${result.key} : ${result.type} ${result.cause}`,
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
			SimplifyType<TransformMultipartFormDataParams<T>>,
			any,
			ReceiveFormData
		>;
}

import { type ZodType, type infer as ZodInfer, z as zod } from "zod";
import { File } from "@utils/file";
import { getTypedKeys } from "@utils/getTypedKeys";

export interface MultipartFormDataFileParams {
	maxFile: number;
	maxSize: number;
	mimeType: string;
}

export interface MultipartFormDataParams {
	fields?: Record<string, ZodType>;
	files?: Record<string, MultipartFormDataFileParams>;
	strict?: boolean;
}

export type ReceiveFormDataTypeIssue = "file" | "field";

export type ReceiveFormDataCauseIssue = "sizeExceeds" | "qauntityExceeds" | "wrongMimeType";

export class ReceiveFormDataIssue {
	public constructor(
		public type: "file" | "field",
		public key: string,
		public cause: ReceiveFormDataCauseIssue,
	) {}
}

export type ReceiveFormDataExtractor =
	(params: MultipartFormDataParams) => Promise<
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

export function multipartFormData<
	T extends MultipartFormDataParams,
>(params: T) {
	const zodSchemaPostExtract = zod.object({
		...params.fields,
		...getTypedKeys(params.files ?? {})
			.reduce<Record<string, ZodType>>(
				(pv, key) => {
					pv[key] = zod.instanceof(File).array();
					return pv;
				},
				{},
			),
	});

	return zod
		.instanceof(ReceiveFormData)
		.transform(async(value, ctx) => {
			const result = await value.extractor(params);

			if (result instanceof ReceiveFormDataIssue) {
				ctx.addIssue({
					code: "custom",
					message: `${result.key} : ${result.type} ${result.cause}`,
					params: {
						receiveFormDataIssue: result,
					},
				});

				return zod.NEVER;
			}

			return result;
		})
		.pipe(zodSchemaPostExtract) as
		ZodType<
			TransformMultipartFormDataParams<T>,
			any,
			ReceiveFormData
		>;
}

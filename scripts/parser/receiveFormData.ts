import { ZodEffects, ZodType, z as zod, type ZodTypeAny, type input, type ZodEffectsDef, ZodFirstPartyTypeKind, type ZodTypeDef } from "zod";
import { File } from "@utils/file";
import { stringToBytes, type BytesInString } from "@utils/stringToBytes";
import type { SimplifyType } from "@utils/simplifyType";
import { findZodTypeInZodSchema } from "@utils/findZodTypeInZodSchema";

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
		Record<string, string | string[] | File[]> | ReceiveFormDataIssue
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

export class ZodReceiveFormData<
	GenericZodType extends ZodTypeAny = ZodTypeAny,
	GenericRecieveFormDataParams extends RecieveFormDataParams = RecieveFormDataParams,
	_GenericInput extends unknown = input<GenericZodType>,
> extends ZodEffects<
		GenericZodType,
		SimplifyType<TransformRecieveFormDataParams<GenericRecieveFormDataParams>>,
		_GenericInput
	> {
	public recieveFormDataParams: GenericRecieveFormDataParams;

	public constructor(
		{
			recieveFormDataParams,
			...def
		}: ZodEffectsDef<GenericZodType> & { recieveFormDataParams: GenericRecieveFormDataParams },
	) {
		super(def);
		this.recieveFormDataParams = recieveFormDataParams;
	}
}

export function receiveFormData<
	GenericRecieveFormDataParams extends RecieveFormDataParams,
>(params: GenericRecieveFormDataParams, options: RecieveFormDataOptions = {}) {
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

	return new ZodReceiveFormData<
		ZodType<ReceiveFormData, ZodTypeDef, ReceiveFormData>,
		GenericRecieveFormDataParams
	>({
		recieveFormDataParams: params,
		schema: zod.instanceof(ReceiveFormData),
		typeName: ZodFirstPartyTypeKind.ZodEffects,
		effect: {
			type: "transform",
			transform: (value: ReceiveFormData, ctx) => new Promise<any>(
				(resolve) => void value
					.extractor(extractorParams)
					.then((result) => {
						if (result instanceof ReceiveFormDataIssue) {
							ctx.addIssue({
								code: "custom",
								message: result.message,
								params: {
									receiveFormDataIssue: result,
								},
								path: [result.key],
							});

							resolve(zod.NEVER);
						}

						resolve(result);
					}),
			),
		},
	}).pipe(zodSchemaPostExtract) as
		ZodType<
			SimplifyType<
				TransformRecieveFormDataParams<
					GenericRecieveFormDataParams
				>
			>,
			any,
			ReceiveFormData
		>;
}

export function zodSchemaHasReceiveFormData(zodSchema: ZodType): zodSchema is ZodReceiveFormData {
	const [zodReceiveFormData] = findZodTypeInZodSchema(
		[ZodReceiveFormData],
		zodSchema,
	);

	return !!zodReceiveFormData;
}

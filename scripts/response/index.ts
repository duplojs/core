import { getTypedEntries, type UnionToTuple, type UniqueGeneric } from "@duplojs/utils";
import { zod, type ZodSpace } from "@scripts/parser";

const unique = Symbol("unique");

export type PresetGenericResponse = Response<number, string | undefined, unknown>;

export class Response<
	Code extends number,
	Information extends string | undefined,
	Body extends unknown,
> {
	public readonly [unique] = unique;

	public code: Code;

	public information: Information;

	public body: Body;

	public headers: Record<string, string | string[]> = {};

	public keepAlive = false;

	public constructor(
		code: Code,
		information: Information,
		body: Body,
	) {
		this.code = code;
		this.information = information;
		this.body = body;
	}

	public setHeaders(headers: PresetGenericResponse["headers"]) {
		getTypedEntries(headers)
			.forEach(
				([...arg]) => void this.setHeader(...arg),
			);
		return this;
	}

	public setHeader(key: string, value?: PresetGenericResponse["headers"][string]) {
		if (value !== undefined) {
			this.headers[key] = value;
		} else {
			this.deleteHeader(key);
		}
		return this;
	}

	public deleteHeaders(keys: string[]) {
		keys.forEach(
			(key) => void this.deleteHeader(key),
		);
		return this;
	}

	public deleteHeader(key: string) {
		if (this.headers[key]) {
			const { [key]: _removedValue, ...headers } = this.headers;
			this.headers = headers;
		}
		return this;
	}
}

export type ContractResponse = Response<number, string | undefined, ZodSpace.ZodType>;

export type ContractToResponse<
	T extends ContractResponse,
> =
	T extends Response<
		infer code,
		infer information,
		infer zodSchema extends ZodSpace.ZodType
	>
		? Response<code, information, zodSchema["_output"]>
		: never;

export interface ResponseToMakeContracts {
	new(...args: any[]): PresetGenericResponse;
	code: number;
}

export type MakeResponseContract<
	T extends ResponseToMakeContracts,
	I extends string,
	B extends UniqueGeneric<ZodSpace.ZodType>,
> = UnionToTuple<{
	[P in I]: Response<
		T["code"],
		string extends P ? string | undefined : P,
		UniqueGeneric<ZodSpace.ZodType> extends B ? ZodSpace.ZodUndefined : B
	>
}[I]>;

export function makeResponseContract<
	T extends ResponseToMakeContracts,
	I extends string,
	B extends ZodSpace.ZodType,
>(
	response: T,
	info?: I | I[],
	body?: B,
): MakeResponseContract<T, I, B> {
	const informations = info instanceof Array
		? info
		: [info];

	return informations.map(
		(information) => new Response(response.code, information, body ?? zod.undefined()),
	) satisfies ContractResponse[] as never;
}

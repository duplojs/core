import { getTypedEntries } from "@utils/getTypedEntries";
import { zod, type zodSpace } from "@scripts/parser";
import type { UniqueGeneric } from "@utils/uniqueGeneric";
import type { SimplifyType } from "@utils/simplifyType";

const unique = Symbol("unique");

export type PresetGeneriqueResponse = Response<number, string | undefined, unknown>;

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

	public setHeaders(headers: PresetGeneriqueResponse["headers"]) {
		getTypedEntries(headers)
			.forEach(
				([...arg]) => void this.setHeader(...arg),
			);
		return this;
	}

	public setHeader(key: string, value?: PresetGeneriqueResponse["headers"][string]) {
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

export type ContractResponse = Response<number, string | undefined, zodSpace.ZodType>;

export type ContractToResponse<
	T extends ContractResponse,
> =
	T extends Response<
		infer code,
		infer information,
		infer zodSchema extends zodSpace.ZodType
	>
		? Response<code, information, zodSchema["_output"]>
		: never;

export interface ResponseToMakeContracts {
	new(...args: any[]): PresetGeneriqueResponse;
	code: number;
}

export type MakeResponseContract<
	T extends ResponseToMakeContracts,
	I extends string,
	B extends UniqueGeneric<zodSpace.ZodType>,
> = {
	[P in I]: Response<
		T["code"],
		string extends P ? string | undefined : P,
		UniqueGeneric<zodSpace.ZodType> extends B ? zodSpace.ZodUndefined : B
	>
}[I][];

export function makeResponseContract<
	T extends ResponseToMakeContracts,
	I extends string,
	B extends zodSpace.ZodType,
>(
	response: T,
	info?: I | I[],
	body?: B,
): SimplifyType<MakeResponseContract<T, I, B>> {
	const informations = info instanceof Array
		? info
		: [info];

	return informations.map(
		(information) => new Response(response.code, information, body ?? zod.undefined()),
	) satisfies ContractResponse[] as any;
}

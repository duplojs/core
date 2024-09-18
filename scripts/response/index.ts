import { getTypedEntries } from "@utils/getTypedEntries";
import type { zodSpace } from "@scripts/zod";

const unique = Symbol("unique");

export class Response<
	Code extends number = number,
	Information extends string | undefined = string | undefined,
	Body extends unknown = unknown,
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

	public setHeaders(headers: Response["headers"]) {
		getTypedEntries(headers)
			.forEach(
				([...arg]) => void this.setHeader(...arg),
			);
		return this;
	}

	public setHeader(key: string, value?: Response["headers"][string]) {
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

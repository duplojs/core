import { getTypedEntries } from "@utils/getTypedEntries";

export class Response<
	Code extends number = number,
	Information extends string | undefined = string | undefined,
	Body extends unknown = unknown,
> {
	public code: Code;

	public information: Information;

	public body: Body;

	public headers: Record<string, string | string[]> = {};

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

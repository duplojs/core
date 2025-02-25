import { getTypedEntries, type OverrideInterface } from "@duplojs/utils";

export interface RequestInitializationData {
	readonly headers: Partial<Record<string, string | string[]>>;
	readonly host: string;
	readonly matchedPath: string | null;
	readonly method: string;
	readonly origin: string;
	readonly params: Partial<Record<string, string>>;
	readonly path: string;
	readonly query: Partial<Record<string, string | string[]>>;
	readonly url: string;
}

export class Request implements RequestInitializationData {
	public method: string;

	public headers: Partial<Record<string, string | string[]>>;

	public url: string;

	public host: string;

	public origin: string;

	public path: string;

	public params: Partial<Record<string, string>>;

	public query: Partial<Record<string, string | string[]>>;

	public matchedPath: string | null;

	public body: unknown = undefined;

	public constructor({
		method,
		headers,
		url,
		host,
		origin,
		path,
		params,
		query,
		matchedPath,
		...rest
	}: RequestInitializationData) {
		this.method = method;
		this.headers = headers;
		this.url = url;
		this.host = host;
		this.origin = origin;
		this.path = path;
		this.params = params;
		this.query = query;
		this.matchedPath = matchedPath;

		getTypedEntries(rest as RequestInitializationData).forEach(
			([key, value]) => {
				this[key] = value as never;
			},
		);
	}
}

export interface RequestObject {
	empty: null;
}

export type CurrentRequestObject = OverrideInterface<{ override: Request }, RequestObject>["override"];

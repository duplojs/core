import type { GetPropsWithTrueValue } from "@utils/getPropsWithTrueValue";
import type { OverrideInterface } from "@utils/overrideInterface";

export interface HttpMethods {
	DELETE: true;
	GET: true;
	HEAD: true;
	OPTIONS: true;
	PATCH: true;
	POST: true;
	PUT: true;
}

export type HttpMethod = GetPropsWithTrueValue<HttpMethods>;

export interface RequestInitializationData {
	readonly headers: Partial<Record<string, string>>;
	readonly host: string;
	readonly matchedPath: string | null;
	readonly method: HttpMethod;
	readonly origin: string;
	readonly params: Record<string, string>;
	readonly path: string;
	readonly query: Record<string, string | string[]>;
	readonly url: string;
}

export class Request implements RequestInitializationData {
	public method: HttpMethod;

	public headers: Partial<Record<string, string>>;

	public url: string;

	public host: string;

	public origin: string;

	public path: string;

	public params: Record<string, string>;

	public query: Record<string, string | string[]>;

	public matchedPath: string | null;

	public body: unknown = undefined;

	public constructor(initializationData: RequestInitializationData) {
		this.method = initializationData.method;
		this.headers = initializationData.headers;
		this.url = initializationData.url;
		this.host = initializationData.host;
		this.origin = initializationData.origin;
		this.path = initializationData.path;
		this.params = initializationData.params;
		this.query = initializationData.query;
		this.matchedPath = initializationData.matchedPath;
	}
}

export interface RequestObject {
	empty: null;
}

export type CurrentRequestObject = OverrideInterface<{ override: Request }, RequestObject>["override"];

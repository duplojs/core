import { GetPropsWithTrueValue } from "@utils/getPropsWithTrueValue";
import { OverrideInterface } from "@utils/overrideInterface";

export interface HttpMethods {
	GET: true;
	POST: true;
	PUT: true;
	PATCH: true;
	DELETE: true;
	OPTIONS: true;
	HEAD: true;
}

export type HttpMethod = GetPropsWithTrueValue<HttpMethods>;

export interface RequestInitializationData {
	readonly method: HttpMethods;
	readonly headers: Partial<Record<string, string>>;
	readonly url: string;
	readonly host: string;
	readonly origin: string;
	readonly path: string;
	readonly params: Record<string, string>;
	readonly query: Record<string, string | string[]>;
	readonly matchedPath: string | null;
}

export class Request implements RequestInitializationData {
	public method: HttpMethods;

	public headers: Partial<Record<string, string>>;

	public url: string;

	public host: string;

	public origin: string;

	public path: string;

	public params: Record<string, string>;

	public query: Record<string, string | string[]>;

	public matchedPath: string | null;

	public body: unknown = undefined;

	constructor(initializationData: RequestInitializationData) {
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

export interface RequestObject {}

export type CurrentRequestObject = OverrideInterface<{ override: Request }, RequestObject>["override"];

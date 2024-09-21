import { type RequestInitializationData, Request } from "@duplojs/core";

export function makeFakeRequest(params?: Partial<RequestInitializationData & { body: any }>) {
	return new Request({
		method: "GET",
		path: "/",
		headers: {},
		query: {},
		params: {},
		host: "",
		matchedPath: "/",
		origin: "",
		url: "",
		...params,
	});
}

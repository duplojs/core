import type { Duplose, ExtractErrorFunction } from "./duplose";
import { makeHooksRouteLifeCycle } from "./hook";
import { UnprocessableEntityHttpResponse } from "./response/simplePreset";

export class Duplo {
	public duploses: Duplose[] = [];

	public hooksRouteLifeCycle = makeHooksRouteLifeCycle();

	public extractError: ExtractErrorFunction = (type, key, error) => new UnprocessableEntityHttpResponse(`TYPE_ERROR.${type}${key ? `.${key}` : ""}`, error);

	public register(duplose: Duplose) {
		duplose.instance = this;
		this.duploses.push(duplose);
	}
}
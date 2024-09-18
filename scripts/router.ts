import { advancedEval } from "@utils/advancedEval";
import type { Route, RouteBuildedFunction } from "./duplose/route";
import type { HttpMethod, RequestInitializationData } from "./request";
import { getTypedEntries } from "@utils/getTypedEntries";
import { StringBuilder } from "@utils/stringBuilder";
import { hasKey } from "@utils/hasKey";

export interface RouterFinderResult {
	buildedRoute: RouteBuildedFunction;
	params: RequestInitializationData["params"];
	matchedPath: string | null;
}

export type RouterFinder = (path: string) => RouterFinderResult | null;

export class Router {
	public readonly methodToRoutesMapper: Partial<
		Record<HttpMethod, Route[]>
	>;

	public readonly methodToFinderMapper: Partial<
		Record<HttpMethod, RouterFinder>
	>;

	public readonly buildedNotfoundRoutes: RouteBuildedFunction;

	public constructor(
		public readonly routes: Route[],
		public readonly notfoundRoutes: Route,
	) {
		this.buildedNotfoundRoutes = notfoundRoutes.build();

		this.methodToRoutesMapper = routes
			.reduce<Router["methodToRoutesMapper"]>(
				(pv, route) => {
					const routeMethod = route.method;

					if (!pv[routeMethod]) {
						pv[routeMethod] = [];
					}

					pv[routeMethod].push(route);

					return pv;
				},
				{},
			);

		this.methodToFinderMapper = getTypedEntries(this.methodToRoutesMapper)
			.reduce<Router["methodToFinderMapper"]>(
				(pv, [method, routes]) => {
					const functionContent = routes.flatMap(
						(route, index) => route.paths.map(
							(path) => /* js */`
								${StringBuilder.result} = ${Router.pathToStringRegExp(path)}.exec(path);
								if(${StringBuilder.result} !== null) return {
									buildedRoute: this.buildedRoutes[${index}],
									params: ${StringBuilder.result}.groups || {},
									matchedPath: "${path}",
								};
							`,
						),
					).join("\n");

					pv[method] = advancedEval<RouterFinder>({
						args: ["path"],
						content: /* js */`
							let ${StringBuilder.result};

							${functionContent}

							return null;
						`,
						bind: {
							buildedRoutes: routes.map((route) => route.build()),
						},
					});
					return pv;
				},
				{},
			);
	}

	public find(method: string, path: string): RouterFinderResult {
		let finder: RouterFinder | undefined = undefined;

		if (
			hasKey(this.methodToFinderMapper, method)
			&& this.methodToFinderMapper[method]
		) {
			finder = this.methodToFinderMapper[method];
		}

		return finder?.(path) ?? {
			buildedRoute: this.buildedNotfoundRoutes,
			params: {},
			matchedPath: null,
		};
	}

	public static pathToStringRegExp(path: string) {
		let regExpPath = path
			.replace(/\//g, "\\/")
			.replace(/\.?\*/g, ".*")
			.replace(
				/\{([A-zÀ-ÿ0-9_-]+)\}/g,
				(match, group1) => `(?<${group1}>[A-zÀ-ÿ0-9_\\- ]+)`,
			);

		regExpPath = `/^${regExpPath}\\/?(?:\\?[^]*)?$/`;

		return regExpPath;
	}
}

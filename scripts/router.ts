
import type { HttpMethod, Route, RouteBuildedFunction } from "./duplose/route";
import type { RequestInitializationData } from "./request";
import { StringBuilder } from "@utils/stringBuilder";
import { Evaler, type EvalerParams } from "@scripts/evaler";
import type { Duplo } from "./duplo";
import { getTypedEntries, hasKey } from "@duplojs/utils";

export interface RouterFinderResult {
	buildedRoute: RouteBuildedFunction;
	params: RequestInitializationData["params"];
	matchedPath: string | null;
}

export type RouterFinder = (path: string) => RouterFinderResult | null;

export interface RouterEvalerParams extends EvalerParams {
	router: Router;
}

export class RouterEvaler extends Evaler<RouterEvalerParams> {

}

export class BuildedRouter {
	public constructor(
		public router: Router,
		public readonly methodToFinderMapper: Partial<
			Record<HttpMethod, RouterFinder>
		>,
		public readonly buildedNotfoundRoutes: RouteBuildedFunction,
	) {

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
}

export class Router {
	public readonly methodToRoutesMapper: Partial<
		Record<HttpMethod, Route[]>
	>;

	public evaler?: RouterEvaler;

	public constructor(
		public readonly instance: Duplo,
		public readonly routes: Route[],
		public readonly notfoundRoutes: Route,
	) {
		this.methodToRoutesMapper = routes
			.reduce<Router["methodToRoutesMapper"]>(
				(pv, route) => {
					const routeMethod = route.definiton.method;

					if (!pv[routeMethod]) {
						pv[routeMethod] = [];
					}

					pv[routeMethod].push(route);

					return pv;
				},
				{},
			);
	}

	public async build() {
		const evaler = this.evaler ?? this.instance.evalers.router ?? Router.defaultEvaler;

		const methodToFinderMapper = await getTypedEntries(this.methodToRoutesMapper)
			.reduce<Promise<BuildedRouter["methodToFinderMapper"]>>(
				async(pv, [method, routes]) => {
					const functionContent = routes.flatMap(
						(route, index) => route.fullPaths.map(
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

					const acc = await pv;

					return {
						...acc,
						[method]: await evaler.makeFunction<RouterFinder>({
							router: this,
							args: ["path"],
							content: /* js */`
								let ${StringBuilder.result};
	
								${functionContent}
	
								return null;
							`,
							bind: {
								buildedRoutes: await Promise.all(
									routes.map((route) => route.build()),
								),
							},
						}),
					};
				},
				Promise.resolve({}),
			);

		const buildedNotfoundRoutes = await this.notfoundRoutes.build();

		return new BuildedRouter(
			this,
			methodToFinderMapper,
			buildedNotfoundRoutes,
		);
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

	public static defaultEvaler = new RouterEvaler();
}

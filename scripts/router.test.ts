/* eslint-disable no-eval */
import { Router } from "./router";
import { Route } from "./duplose/route";
import { HandlerStep } from "./step/handler";
import type { AnyFunction } from "@utils/types";
import { DuploTest } from "@test/utils/duploTest";

describe("Router", () => {
	const duplo = new DuploTest({ environment: "TEST" });

	const routes = [
		new Route("GET", ["/users", "/users/{userId}"]),
		new Route("GET", ["/posts", "/posts/{postId}"]),
		new Route("POST", ["/users"]),
		new Route("POST", ["/posts"]),
		new Route("PATCH", ["/users/{userId}"]),
		new Route("PATCH", ["/posts/{postId}"]),
	];

	const notfoundRoute = new Route("GET", ["/*"]);
	notfoundRoute.addStep(
		new HandlerStep((() => ({})) as AnyFunction),
	);
	duplo.register(notfoundRoute);

	routes.forEach((route) => {
		route.addStep(
			new HandlerStep((() => ({})) as AnyFunction),
		);

		duplo.register(route);
	});

	it("mapper and function builder", async() => {
		const spy = vi.spyOn(Router.defaultEvaler, "makeFunction");
		const router = new Router(duplo, routes, notfoundRoute);

		const buildedRouter = await router.build();

		expect(router.methodToRoutesMapper).toStrictEqual({
			GET: [routes[0], routes[1]],
			POST: [routes[2], routes[3]],
			PATCH: [routes[4], routes[5]],
		});

		Object.values(buildedRouter.methodToFinderMapper).forEach(
			(value) => {
				expect(value).toBeTypeOf("function");
			},
		);

		await expect(spy.mock.lastCall?.[0].content).toMatchFileSnapshot("__data__/router.txt");
	});

	it("test finder", async() => {
		const router = new Router(duplo, routes, notfoundRoute);

		const buildedRouter = await router.build();

		expect({
			...buildedRouter.find("GET", "/users"),
			buildedRoute: undefined,
		}).toStrictEqual({
			matchedPath: "/users",
			params: {},
			buildedRoute: undefined,
		});

		expect({
			...buildedRouter.find("GET", "/users/15"),
			buildedRoute: undefined,
		}).toEqual({
			matchedPath: "/users/{userId}",
			params: { userId: "15" },
			buildedRoute: undefined,
		});

		expect(buildedRouter.find("GET", "/user")).toStrictEqual({
			buildedRoute: buildedRouter.buildedNotfoundRoutes,
			matchedPath: null,
			params: {},
		});

		expect(buildedRouter.find("PUT", "/user")).toStrictEqual({
			buildedRoute: buildedRouter.buildedNotfoundRoutes,
			matchedPath: null,
			params: {},
		});

		expect(
			buildedRouter.find("GET", "/users/15")?.buildedRoute.context.duplose,
		).toBe(routes[0]);

		expect(
			buildedRouter.find("GET", "/users")?.buildedRoute.context.duplose,
		).toBe(routes[0]);

		expect(
			buildedRouter.find("POST", "/posts")?.buildedRoute.context.duplose,
		).toBe(routes[3]);
	});

	describe("pathToStringRegExp", () => {
		it("simple", () => {
			const regExp: RegExp = eval(Router.pathToStringRegExp("/"));

			expect(!!regExp.exec("/")).toBe(true);

			expect(!!regExp.exec("/lolo")).toBe(false);
		});

		it("all", () => {
			const regExp: RegExp = eval(Router.pathToStringRegExp("/toto*"));

			expect(!!regExp.exec("/toto")).toBe(true);
			expect(!!regExp.exec("/toto/fedsfsdfe")).toBe(true);
			expect(!!regExp.exec("/totofedsfsdfe")).toBe(true);
			expect(!!regExp.exec("/tot/o")).toBe(false);
		});

		it("args", () => {
			const regExp: RegExp = eval(Router.pathToStringRegExp("/users/{userId}/post/{postId}"));

			expect(!!regExp.exec("/users//post/12")).toBe(false);
			expect(!!regExp.exec("/users/12/post/")).toBe(false);
			expect({ ...regExp.exec("/users/12/post/12")?.groups }).toStrictEqual({
				userId: "12",
				postId: "12",
			});
		});
	});
});

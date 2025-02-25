import { Router } from "./router";
import { Route } from "./duplose/route";
import { HandlerStep } from "./step/handler";
import { DuploTest } from "@test/utils/duploTest";
import { createRouteDefinition } from "@test/utils/manualDuplose";
import { type AnyFunction } from "@duplojs/utils";

describe("Router", () => {
	const duplo = new DuploTest({ environment: "TEST" });

	const routes = [
		new Route(createRouteDefinition({
			method: "GET",
			paths: ["/users", "/users/{userId}"],
		})),
		new Route(createRouteDefinition({
			method: "GET",
			paths: ["/posts", "/posts/{postId}"],
		})),
		new Route(createRouteDefinition({
			method: "POST",
			paths: ["/users"],
		})),
		new Route(createRouteDefinition({
			method: "POST",
			paths: ["/posts"],
		})),
		new Route(createRouteDefinition({
			method: "PATCH",
			paths: ["/users/{userId}"],
		})),
		new Route(createRouteDefinition({
			method: "PATCH",
			paths: ["/posts/{postId}"],
		})),
	];

	const notfoundRoute = new Route(createRouteDefinition({
		steps: [new HandlerStep((() => ({})) as AnyFunction)],
	}));
	duplo.register(notfoundRoute);
	routes.forEach((route) => {
		route.definiton.steps.push(
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

		expect(spy.mock.lastCall?.[0].content).toMatchSnapshot();
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

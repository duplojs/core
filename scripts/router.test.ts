/* eslint-disable no-eval */
import { mokeAdvancedEval } from "@test/utils/mokeAdvancedEval";
import { Router } from "./router";
import { Route } from "./duplose/route";
import { Duplo } from "./duplo";
import { HandlerStep } from "./step/handler";
import type { AnyFunction } from "@utils/types";
import { readFile } from "fs/promises";
import { resolve } from "path";

describe("Router", async() => {
	const {
		advancedEval: spy,
		advancedEvalOriginal,
	} = await mokeAdvancedEval();

	const duplo = new Duplo();

	const routes = [
		new Route("GET", ["/users", "/users/{userId}"]),
		new Route("GET", ["/posts", "/posts/{postId}"]),
		new Route("POST", ["/users"]),
		new Route("POST", ["/posts"]),
		new Route("PATCH", ["/users/{userId}"]),
		new Route("PATCH", ["/posts/{postId}"]),
	];

	routes.forEach((route) => {
		route.addStep(
			new HandlerStep((() => ({})) as AnyFunction),
		);

		duplo.register(route);
	});

	beforeEach(() => {
		spy.mockImplementation(() => (() => ({})));
	});

	it("mapper and function builder", async() => {
		const router = new Router(routes);

		expect(router.methodToRoutesMapper).toStrictEqual({
			GET: [routes[0], routes[1]],
			POST: [routes[2], routes[3]],
			PATCH: [routes[4], routes[5]],
		});

		Object.values(router.methodToFinderMapper).forEach(
			(value) => {
				expect(value).toBeTypeOf("function");
			},
		);

		expect(spy).lastCalledWith({
			args: ["path"],
			bind: spy.mock.lastCall?.[0].bind,
			content: await readFile(resolve(import.meta.dirname, "__data__/router.txt"), "utf-8"),
		});
	});

	it("test finder", () => {
		spy.mockImplementation(advancedEvalOriginal);

		const router = new Router(routes);

		expect({
			...router.find("GET", "/users"),
			buildedRoute: undefined,
		}).toStrictEqual({
			matchedPath: "/users",
			params: {},
			buildedRoute: undefined,
		});

		expect({
			...router.find("GET", "/users/15"),
			buildedRoute: undefined,
		}).toEqual({
			matchedPath: "/users/{userId}",
			params: { userId: "15" },
			buildedRoute: undefined,
		});

		expect(router.find("GET", "/user")).toStrictEqual(null);

		expect(router.find("PUT", "/user")).toStrictEqual(null);

		expect(
			router.find("GET", "/users/15")?.buildedRoute.context.duplose,
		).toBe(routes[0]);

		expect(
			router.find("GET", "/users")?.buildedRoute.context.duplose,
		).toBe(routes[0]);

		expect(
			router.find("POST", "/posts")?.buildedRoute.context.duplose,
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
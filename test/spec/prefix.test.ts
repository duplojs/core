import { LocalPrefixDescription, OkHttpResponse, useBuilder, useRouteBuilder } from "@scripts/index";
import { createDuploTest } from "@test/utils/duploTest";

describe("prefix", () => {
	it("no Prefix", () => {
		const route = useBuilder()
			.createRoute("GET", "/my-path")
			.handler(() => new OkHttpResponse("test"));

		expect(route.fullPaths).toEqual(["/my-path"]);
	});

	it("global", () => {
		const duplo = createDuploTest({ prefix: "/global-prefix" });

		const route = useBuilder()
			.createRoute("GET", "/my-path")
			.handler(() => new OkHttpResponse("test"));

		duplo.register(route);

		expect(route.fullPaths).toEqual(["/global-prefix/my-path"]);
	});

	it("context", () => {
		useRouteBuilder.setContextPrefixToNextCreatedRoutes(["context-prefix/", "latest/tsetal"]);

		const route1 = useBuilder()
			.createRoute("GET", "/my-path")
			.handler(() => new OkHttpResponse("test"));

		expect(route1.fullPaths).toEqual([
			"/context-prefix/my-path",
			"/latest/tsetal/my-path",
		]);

		useRouteBuilder.removeActiveContextPrefix();

		const route2 = useBuilder()
			.createRoute("GET", "/my-path")
			.handler(() => new OkHttpResponse("test"));

		expect(route2.fullPaths).toEqual(["/my-path"]);
	});

	it("local", () => {
		const route1 = useBuilder(new LocalPrefixDescription("/local-prefix"))
			.createRoute("GET", "/my-path")
			.handler(() => new OkHttpResponse("test"));

		expect(route1.fullPaths).toEqual(["/local-prefix/my-path"]);

		const route2 = useBuilder()
			.createRoute("GET", "/my-path", new LocalPrefixDescription("/local-prefix"))
			.handler(() => new OkHttpResponse("test"));

		expect(route2.fullPaths).toEqual(["/local-prefix/my-path"]);
	});
});

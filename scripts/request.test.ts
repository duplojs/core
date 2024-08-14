import { Request } from "./request";

describe("Test request object", () => {
	it("constructore", () => {
		new Request({
			headers: {},
			host: "campani.fr",
			matchedPath: "/user/{id}",
			method: "GET",
			origin: "https://campani.fr",
			url: "/user/150?withDetails=true",
			path: "/user/150",
			params: { id: "150" },
			query: { withDetails: "true" },
		});
	});
});

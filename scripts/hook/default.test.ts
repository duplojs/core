import { hookRouteError } from "./default";

describe("default hook", () => {
	it("route error", () => {
		expect(() => void hookRouteError({} as any, new Error())).toThrowError(Error);
	});
});

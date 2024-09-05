import { Hook } from ".";
import { HooksRouteLifeCycle } from "./routeLifeCycle";

it("HooksRouteLifeCycle", () => {
	const hooks = new HooksRouteLifeCycle();
	Object.entries(hooks).forEach(([key, hook]) => {
		if (key === "import") {
			return;
		}

		expect(hook).instanceOf(Hook);
	});
});

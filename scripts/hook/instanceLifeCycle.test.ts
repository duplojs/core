import { Hook } from ".";
import { HooksInstanceifeCycle } from "./instanceLifeCycle";

it("HooksInstanceifeCycle", () => {
	const hooks = new HooksInstanceifeCycle();
	Object.entries(hooks).forEach(([key, hook]) => {
		if (key === "import") {
			return;
		}

		expect(hook).instanceOf(Hook);
	});
});

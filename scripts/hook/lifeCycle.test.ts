import { Hook } from ".";
import { HooksLifeCycle } from "./lifeCycle";

class TestedHooks extends HooksLifeCycle {
	public test = new Hook(0);
}

describe("HooksLifeCycle", () => {
	it("import", () => {
		const base = new TestedHooks();
		const imported = new TestedHooks();

		base.import(imported);

		expect(base.test.subscribers[0]).toBe(imported.test);
	});
});

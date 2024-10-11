import { Evaler } from "./evaler";
import type { AnyFunction } from "./utils/types";

describe("advancedEval", () => {
	class TestEvaler extends Evaler {

	}

	it("bind", async() => {
		const testEvaler = new TestEvaler();

		const fnc = await testEvaler.makeFunction<AnyFunction>({
			content: "return 'ok'",
		});

		expect(fnc).toBeTypeOf("function");
	});
});

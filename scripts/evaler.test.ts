import { type AnyFunction } from "@duplojs/utils";
import { Evaler } from "./evaler";

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

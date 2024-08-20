import { advancedEval } from "./advancedEval";
import type { AnyFunction } from "./types";

describe("advancedEval", () => {
	it("bind", () => {
		const fnc = advancedEval<AnyFunction>({
			content: "return 'ok'",
		});

		expect(fnc).toBeTypeOf("function");
	});
});

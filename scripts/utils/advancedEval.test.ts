import { advancedEval, AdvancedEvalError } from "./advancedEval";
import type { AnyFunction } from "./types";

describe("advancedEval", () => {
	it("unsafe content", () => {
		expect(() => advancedEval({ content: "const fs = require('fs')" })).toThrowError(AdvancedEvalError);
	});

	it("unsafe bind and auto launch", () => {
		const resultEvalFunction = advancedEval({
			content: "return this.quoi",
			bind: {
				quoi: "coubeh",
			},
			autoLaunch: true,
		});

		expect(resultEvalFunction).toBe("coubeh");
	});

	it("unsafe bind and auto launch", () => {
		const fnc = advancedEval<AnyFunction>({
			content: "return 'ok'",
		});

		expect(fnc).toBeTypeOf("function");
	});
});

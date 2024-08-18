import type { ExpectType } from "@test/utils/expectType";
import { Checker, type GetCheckerGeneric } from "./checker";

describe("checker", () => {
	const checker = new Checker<
		{ test: 1 },
		number,
		{
			info: "toto";
			data: null;
		}
	>("test");

	it("options", () => {
		checker.setOptions({ test: "test" }, []);

		expect(checker.options).toStrictEqual({ test: "test" });
	});

	it("options", () => {
		const handler = () => ({
			info: "toto",
			data: null,
		});
		checker.setHandler(handler, []);

		expect(checker.handler).toBe(handler);
	});

	type check = ExpectType<
		GetCheckerGeneric<typeof checker>,
		{
			options: { test: 1 };
			input: number;
			output: {
				info: "toto";
				data: null;
			};
		},
		"strict"
	>;
});

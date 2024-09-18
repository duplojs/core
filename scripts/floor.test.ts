import type { ExpectType } from "@test/utils/expectType";
import { makeFloor } from "./floor";

it("floot", () => {
	const floor = makeFloor<{ test: number }>();

	floor.drop("test", 5);

	const value = floor.pickup("test");

	expect(value).toBe(5);

	const values = floor.pickup(["test"]);

	expect(values).toStrictEqual({ test: 5 });

	type check = ExpectType<typeof value, number, "strict">;
});

import type { ExpectType } from "../../test/utils/expectType";
import { getTypedKeys } from "./getTypedKeys";

it("getTypedKeys", () => {
	const keys = getTypedKeys({
		toto: 1,
		tt: "ee",
	});

	expect(keys).toStrictEqual(["toto", "tt"]);

	type check = ExpectType<
		typeof keys,
		("toto" | "tt")[],
		"strict"
	>;
});

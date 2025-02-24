import { PrefixDescription } from ".";

it("PrefixDescription", () => {
	class SubPrefixDescription extends PrefixDescription {
	}

	const prefix = new SubPrefixDescription("test");

	expect(prefix.value).toEqual(["/test"]);
});

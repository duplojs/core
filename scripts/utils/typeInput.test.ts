import type { ExpectType } from "@test/utils/expectType";
import { createTypeInput, type GetTypeInput } from "./typeInput";

it("createTypeInput", () => {
	const inputer = createTypeInput<{
		id: number;
		name: string;
	}>();

	const id = inputer.id(15);
	type check1 = ExpectType<
		typeof id,
		{
			inputName: "id";
			value: number;
		},
		"strict"
	>;

	const name = inputer.name("toto");
	type check2 = ExpectType<
		typeof name,
		{
			inputName: "name";
			value: string;
		},
		"strict"
	>;

	expect(id).toStrictEqual({
		inputName: "id",
		value: 15,
	});

	expect(name).toStrictEqual({
		inputName: "name",
		value: "toto",
	});

	type check3 = ExpectType<
		GetTypeInput<typeof inputer>,
		| {
			inputName: "name";
			value: string;
		}
		| {
			inputName: "id";
			value: number;
		},
		"strict"
	>;

	type check4 = ExpectType<
		GetTypeInput<typeof inputer, "id">,
		{
			inputName: "id";
			value: number;
		},
		"strict"
	>;
});

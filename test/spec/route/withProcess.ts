import { OkHttpResponse, useBuilder } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";
import { fixtureProcessWichDropValue } from "@test/utils/fixture";

export const routeWithProcess = useBuilder()
	.createRoute("GET", "/")
	.execute(
		fixtureProcessWichDropValue,
		{
			pickup: ["dropOptions", "dropInput"],
			options: { option1: "myOption" },
			input: () => 66,
		},
	)
	.cut(
		({ dropper, pickup }) => {
			const { dropInput, dropOptions } = pickup(["dropInput", "dropOptions"]);

			type check1 = ExpectType<
				typeof dropInput,
				number,
				"strict"
			>;

			type check2 = ExpectType<
				typeof dropOptions,
				{
					option1: string;
					option2: number;
				},
				"strict"
			>;

			return dropper({
				dropInput1: dropInput,
				dropOptions1: dropOptions,
			});
		},
		["dropOptions1", "dropInput1"],
	)
	.execute(
		fixtureProcessWichDropValue,
		{
			pickup: ["dropOptions", "dropInput"],
			options: (pickup) => {
				const { dropOptions } = pickup(["dropOptions"]);
				return {
					...dropOptions,
					option2: 33,
				};
			},
		},
	)
	.handler(
		(pickup) => {
			const { dropInput, dropOptions, dropInput1, dropOptions1 }
				= pickup(["dropInput", "dropOptions", "dropInput1", "dropOptions1"]);

			return new OkHttpResponse(undefined, {
				dropInput1,
				dropOptions1,
				dropInput2: dropInput,
				dropOptions2: dropOptions,
			});
		},
	);

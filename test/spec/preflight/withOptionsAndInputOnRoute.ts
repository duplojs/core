import { OkHttpResponse, useBuilder } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";
import { fixtureProcessWichDropValue } from "@test/utils/fixture";

export const preflightwithOptionsAndInputOnRoute = useBuilder()
	.preflight(
		fixtureProcessWichDropValue,
		{
			options: {
				option1: "myOptions",
				option2: 45,
			},
			input: () => 333,
			pickup: ["dropInput", "dropOptions"],
		},
	)
	.preflight(
		fixtureProcessWichDropValue,
		{
			options: (pickup) => {
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

				return {
					...dropOptions,
					option2: dropInput,
				};
			},
			input: (pickup) => {
				const { dropOptions } = pickup(["dropOptions"]);

				type check2 = ExpectType<
					typeof dropOptions,
					{
						option1: string;
						option2: number;
					},
					"strict"
				>;

				return dropOptions.option2;
			},
			pickup: ["dropInput", "dropOptions"],
		},
	)
	.createRoute("GET", "/")
	.handler(
		(pickup) => new OkHttpResponse(undefined, pickup(["dropInput", "dropOptions"])),
	);

import { type ExpectType } from "@duplojs/utils";
import { createProcess, OkHttpResponse, useBuilder, zod } from "@scripts/index";
import { fixtureProcessWichDropValue } from "@test/utils/fixture";

const extractProcess = createProcess("extractProcess")
	.extract({ body: zod.number() })
	.exportation(["body"]);

export const preflightWithSkipOnRoute = useBuilder()
	.preflight(
		extractProcess,
		{ pickup: ["body"] },
	)
	.preflight(
		fixtureProcessWichDropValue,
		{
			pickup: ["dropInput", "dropOptions"],
			skip: (pickup) => {
				const { body } = pickup(["body"]);

				type check1 = ExpectType<
					typeof body,
					number,
					"strict"
				>;

				return !!body;
			},
		},
	)
	.createRoute("GET", "/")
	.handler(
		(pickup) => {
			const { dropInput, dropOptions } = pickup(["dropInput", "dropOptions"]);
			type check1 = ExpectType<
				typeof dropInput,
				number | undefined,
				"strict"
			>;

			type check2 = ExpectType<
				typeof dropOptions,
				{
					option1: string;
					option2: number;
				} | undefined,
				"strict"
			>;

			return new OkHttpResponse(undefined, {
				dropInput,
				dropOptions,
			});
		},
	);

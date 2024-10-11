import { useBuilder } from "@scripts/index";
import { duploTest } from "@test/utils/duploTest";
import { preflightOnProcess } from "./preflight/onProcess";
import { makeFakeRequest } from "@test/utils/request";
import { preflightOnRoute } from "./preflight/onRoute";
import { preflightwithOptionsAndInputOnRoute } from "./preflight/withOptionsAndInputOnRoute";
import { preflightWithSkipOnRoute } from "./preflight/withSkipOnRoute";

describe("preflight", () => {
	duploTest.register(...useBuilder.getAllCreatedDuplose());

	it("on process", async() => {
		const buildedProcess = await preflightOnProcess.build();

		const result = await buildedProcess(makeFakeRequest(), undefined, undefined);

		expect(result).toStrictEqual({
			dropInput: 22,
			dropOptions: {
				option1: "test",
				option2: 12,
			},
		});
	});

	it("on route", async() => {
		const buildedProcess = await preflightOnRoute.build();

		const result = await buildedProcess(makeFakeRequest());

		expect(result.body).toStrictEqual({
			dropInput: 22,
			dropOptions: {
				option1: "test",
				option2: 12,
			},
		});
	});

	it("with options and input on route", async() => {
		const buildedProcess = await preflightwithOptionsAndInputOnRoute.build();

		const result = await buildedProcess(makeFakeRequest());

		expect(result.body).toStrictEqual({
			dropInput: 45,
			dropOptions: {
				option1: "myOptions",
				option2: 333,
			},
		});
	});

	it("with skip on route", async() => {
		const buildedProcess = await preflightWithSkipOnRoute.build();

		const result1 = await buildedProcess(makeFakeRequest({ body: 1 }));

		expect(result1.body).toStrictEqual({
			dropInput: undefined,
			dropOptions: undefined,
		});

		const result2 = await buildedProcess(makeFakeRequest({ body: 0 }));

		expect(result2.body).toStrictEqual({
			dropInput: 22,
			dropOptions: {
				option1: "test",
				option2: 12,
			},
		});
	});
});

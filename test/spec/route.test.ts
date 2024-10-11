import { duploTest } from "@test/utils/duploTest";
import { useBuilder, Response, UnprocessableEntityHttpResponse, BadRequestHttpResponse } from "@scripts/index";
import { makeFakeRequest } from "@test/utils/request";
import { routeWithCut } from "./route/withCut";
import { routeWithExtract } from "./route/withExtract";
import { routeWithChecker } from "./route/withChecker";
import { routeWithCheckerWithNoOptions } from "./route/withCheckerHasNoOptions";
import { routeWithPresetChecker } from "./route/withPresetChecker";
import { routeWithSkipChecker } from "./route/withSkipChecker";
import { routeWithProcess } from "./route/withProcess";
import { routeWithSkipProcess } from "./route/withSkipProcess";

describe("process", () => {
	duploTest.register(...useBuilder.getAllCreatedDuplose());

	it("with cut", async() => {
		const buildedProcess = await routeWithCut.build();

		const result = await buildedProcess(makeFakeRequest());

		expect(result.body).toStrictEqual({
			value: "test",
		});
	});

	it("with extract", async() => {
		const buildedProcess = await routeWithExtract.build();

		const result1 = await buildedProcess(makeFakeRequest());

		expect(result1).instanceOf(
			UnprocessableEntityHttpResponse,
		);

		const result2 = await buildedProcess(makeFakeRequest({
			params: {
				userId: "test",
			},
			body: {
				prop1: "test",
				prop2: {
					prop3: "test",
					prop4: {
						prop5: "test",
					},
				},
			},
		}));

		expect(result2.body).toStrictEqual({
			userId: "test",
			body: {
				prop1: "test",
				prop2: {
					prop3: "test",
					prop4: {
						prop5: "test",
					},
				},
			},
		});
	});

	it("with checker", async() => {
		const buildedProcess = await routeWithChecker.build();

		const result1 = await buildedProcess(makeFakeRequest({ body: 0 }));

		expect(result1).instanceOf(BadRequestHttpResponse);

		const result2 = await buildedProcess(makeFakeRequest({ body: 1 }));

		expect(result2.body).toStrictEqual({
			valueCheck1: {
				option1: "toto",
				option2: 11,
			},
			valueCheck2: {
				option1: "1",
				option2: 11,
			},
		});
	});

	it("with checker has no options", async() => {
		const buildedProcess = await routeWithCheckerWithNoOptions.build();

		const result1 = await buildedProcess(makeFakeRequest({ body: 0 }));

		expect(result1).instanceOf(BadRequestHttpResponse);

		const result2 = await buildedProcess(makeFakeRequest({ body: 1 }));

		expect(result2.body).toStrictEqual({
			valueCheck: true,
		});
	});

	it("with preset checker", async() => {
		const buildedProcess = await routeWithPresetChecker.build();

		const result1 = await buildedProcess(makeFakeRequest({ body: 0 }));

		expect(result1).instanceOf(BadRequestHttpResponse);

		const result2 = await buildedProcess(makeFakeRequest({ body: 1 }));

		expect(result2.body).toStrictEqual({
			valueCheck: {
				option1: "settedOption",
				option2: 11,
			},
		});
	});

	it("with skip checker", async() => {
		const buildedProcess = await routeWithSkipChecker.build();

		const result1 = await buildedProcess(makeFakeRequest({ body: 0 }));

		expect(result1.body).toStrictEqual({
			valueCheck: true,
		});

		const result2 = await buildedProcess(makeFakeRequest({ body: 1 }));

		expect(result2.body).toStrictEqual({
			valueCheck: undefined,
		});
	});

	it("with Process", async() => {
		const buildedProcess = await routeWithProcess.build();

		const result = await buildedProcess(
			makeFakeRequest(),
		);

		expect(result.body).toStrictEqual({
			dropInput1: 66,
			dropInput2: 22,
			dropOptions1: {
				option1: "myOption",
				option2: 12,
			},
			dropOptions2: {
				option1: "myOption",
				option2: 33,
			},
		});
	});

	it("with skip process", async() => {
		const buildedProcess = await routeWithSkipProcess.build();

		const result1 = await buildedProcess(makeFakeRequest({ body: 0 }));

		expect(result1.body).toStrictEqual({
			dropInput: 22,
			dropOptions: {
				option1: "test",
				option2: 12,
			},
		});

		const result2 = await buildedProcess(makeFakeRequest({ body: 1 }));

		expect(result2.body).toStrictEqual({
			dropInput: undefined,
			dropOptions: undefined,
		});
	});
});

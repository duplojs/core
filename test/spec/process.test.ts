import { duploTest } from "@test/utils/duploTest";
import { Response, UnprocessableEntityHttpResponse, useProcessBuilder, useRouteBuilder } from "@scripts/index";
import { makeFakeRequest } from "@test/utils/request";
import { processWithCut } from "./process/withCut";
import { processWithChecker } from "./process/withChecker";
import { processWithExtract } from "./process/withExtract";
import { processWithCheckerWithNoOptions } from "./process/withCheckerHasNoOptions";
import { processWithPresetChecker } from "./process/withPresetChecker";
import { processWithSkipChecker } from "./process/withSkipChecker";
import { processWithOptionsAndInput } from "./process/withOptionsAndInput";
import { processWithProcess } from "./process/withProcess";
import { processWithSkipProcess } from "./process/withSkipProcess";

describe("process", () => {
	duploTest.register(
		...useProcessBuilder.getAllCreatedProcess(),
		...useRouteBuilder.getAllCreatedRoute(),
	);

	it("with cut", async() => {
		const buildedProcess = await processWithCut.build();

		const result = await buildedProcess(makeFakeRequest(), undefined, undefined);

		expect(result).toStrictEqual({
			value: "test",
		});
	});

	it("with extract", async() => {
		const buildedProcess = await processWithExtract.build();

		const result1 = await buildedProcess(makeFakeRequest(), undefined, undefined);

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
		}), undefined, undefined);

		expect(result2).toStrictEqual({
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
		const buildedProcess = await processWithChecker.build();

		const result1 = await buildedProcess(makeFakeRequest({ body: 0 }), undefined, undefined);

		expect(result1).instanceOf(Response);

		const result2 = await buildedProcess(makeFakeRequest({ body: 1 }), undefined, undefined);

		expect(result2).toStrictEqual({
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
		const buildedProcess = await processWithCheckerWithNoOptions.build();

		const result1 = await buildedProcess(makeFakeRequest({ body: 0 }), undefined, undefined);

		expect(result1).instanceOf(Response);

		const result2 = await buildedProcess(makeFakeRequest({ body: 1 }), undefined, undefined);

		expect(result2).toStrictEqual({
			valueCheck: true,
		});
	});

	it("with preset checker", async() => {
		const buildedProcess = await processWithPresetChecker.build();

		const result1 = await buildedProcess(makeFakeRequest({ body: 0 }), undefined, undefined);

		expect(result1).instanceOf(Response);

		const result2 = await buildedProcess(makeFakeRequest({ body: 1 }), undefined, undefined);

		expect(result2).toStrictEqual({
			valueCheck: {
				option1: "settedOption",
				option2: 11,
			},
		});
	});

	it("with skip checker", async() => {
		const buildedProcess = await processWithSkipChecker.build();

		const result1 = await buildedProcess(makeFakeRequest({ body: 0 }), undefined, undefined);

		expect(result1).toStrictEqual({
			valueCheck: true,
		});

		const result2 = await buildedProcess(makeFakeRequest({ body: 1 }), undefined, undefined);

		expect(result2).toStrictEqual({
			valueCheck: undefined,
		});
	});

	it("with options and input", async() => {
		const buildedProcess = await processWithOptionsAndInput.build();

		const result = await buildedProcess(
			makeFakeRequest(),
			{
				option1: 1,
				option2: "",
			},
			"test",
		);

		expect(result).toStrictEqual({
			input: "test",
			options: {
				option1: 1,
				option2: "",
			},
		});
	});

	it("with Process", async() => {
		const buildedProcess = await processWithProcess.build();

		const result = await buildedProcess(
			makeFakeRequest(),
			undefined,
			undefined,
		);

		expect(result).toStrictEqual({
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
		const buildedProcess = await processWithSkipProcess.build();

		const result1 = await buildedProcess(makeFakeRequest({ body: 0 }), undefined, undefined);

		expect(result1).toStrictEqual({
			dropInput: 22,
			dropOptions: {
				option1: "test",
				option2: 12,
			},
		});

		const result2 = await buildedProcess(makeFakeRequest({ body: 1 }), undefined, undefined);

		expect(result2).toStrictEqual({
			dropInput: undefined,
			dropOptions: undefined,
		});
	});
});

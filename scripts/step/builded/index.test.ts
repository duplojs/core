import { createDuploTest, duploTest } from "@test/utils/duploTest";
import { BuildedStep, BuildedStepWithResponses } from ".";
import { HandlerStep } from "../handler";
import { Response } from "@scripts/response";
import { zod } from "@scripts/parser";
import { ContractResponseHasZodEffectError } from "@scripts/error/contractResponseHasZodEffectError";
import { createFixtureCheckerStep, fixtureCheckerStep } from "@test/utils/fixture";
import { ForceEnabledZodAccelerator } from "@scripts/description/zodAccelerator/forceEnabled";
import { ForceDisabledZodAccelerator } from "@scripts/description/zodAccelerator/forceDisabled";
import { ForceEnabledRuntimeEndPointCheck } from "@scripts/description/runtimeEndPointCheck/forceEnabled";
import { ForceDisabledRuntimeEndPointCheck } from "@scripts/description/runtimeEndPointCheck/forceDisabled";

describe("BuildedStep", () => {
	class SubBuildedStep extends BuildedStep {
		public toString(index: number): string {
			throw new Error("Method not implemented.");
		}
	}

	describe("zodAcceleratorIsEnabled", () => {
		it("no config and no description", () => {
			expect(
				new SubBuildedStep(duploTest, fixtureCheckerStep).zodAcceleratorIsEnabled(),
			).toBe(true);
		});

		it("config disabledZodAccelerator to true", () => {
			expect(
				new SubBuildedStep(createDuploTest({ disabledZodAccelerator: true }), fixtureCheckerStep)
					.zodAcceleratorIsEnabled(),
			).toBe(false);
		});

		it("config disabledZodAccelerator to true but description force enabled", () => {
			const step = createFixtureCheckerStep([new ForceEnabledZodAccelerator()]);

			expect(
				new SubBuildedStep(createDuploTest({ disabledZodAccelerator: true }), step).zodAcceleratorIsEnabled(),
			).toBe(true);
		});

		it("description, force disabled", () => {
			const step = createFixtureCheckerStep([new ForceDisabledZodAccelerator()]);

			expect(
				new SubBuildedStep(duploTest, step).zodAcceleratorIsEnabled(),
			).toBe(false);
		});
	});
});

describe("BuildedStepWithResponses error", () => {
	class SubBuildedStepWithResponses extends BuildedStepWithResponses {
		public toString(index: number): string {
			throw new Error("Method not implemented.");
		}
	}

	it("response contract have zodEffect", () => {
		const step = new HandlerStep(
			() => new Response(200, undefined, undefined),
			[new Response(100, "toto", zod.undefined().transform((value) => value))],
		);

		expect(() => new SubBuildedStepWithResponses(duploTest, step))
			.toThrow(ContractResponseHasZodEffectError);
	});

	it("getBlockContractResponse", () => {
		const step = new HandlerStep(
			() => new Response(200, undefined, undefined),
			[new Response(100, "toto", zod.undefined())],
		);

		expect(
			new SubBuildedStepWithResponses(duploTest, step).getBlockContractResponse(2),
		).toMatchSnapshot();
	});

	describe("runtimeEndPointCheckIsEnabled", () => {
		it("no config and no description", () => {
			expect(
				new SubBuildedStepWithResponses(duploTest, fixtureCheckerStep).runtimeEndPointCheckIsEnabled(),
			).toBe(true);
		});

		it("config disabledRuntimeEndPointCheck to true", () => {
			expect(
				new SubBuildedStepWithResponses(
					createDuploTest({ disabledRuntimeEndPointCheck: true }),
					fixtureCheckerStep,
				)
					.runtimeEndPointCheckIsEnabled(),
			).toBe(false);
		});

		it("config disabledRuntimeEndPointCheck to true but description force enabled", () => {
			const step = createFixtureCheckerStep([new ForceEnabledRuntimeEndPointCheck()]);

			expect(
				new SubBuildedStepWithResponses(createDuploTest({ disabledRuntimeEndPointCheck: true }), step)
					.runtimeEndPointCheckIsEnabled(),
			).toBe(true);
		});

		it("description, force disabled", () => {
			const step = createFixtureCheckerStep([new ForceDisabledRuntimeEndPointCheck()]);

			expect(
				new SubBuildedStepWithResponses(duploTest, step).runtimeEndPointCheckIsEnabled(),
			).toBe(false);
		});
	});
});

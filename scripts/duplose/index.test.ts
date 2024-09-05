import { Duplose } from ".";
import { Process } from "./process";
import { ProcessStep } from "@scripts/step/process";
import { getTypedEntries } from "@utils/getTypedEntries";
import { Response } from "@scripts/response";
import { PreflightStep } from "@scripts/step/preflight";
import { Hook } from "@scripts/hook";

describe("Duplose", () => {
	class SubDuplo extends Duplose {
		public build() {
			throw new Error("Method not implemented.");
		}
	}

	const duplose = new SubDuplo();
	const process1 = new Process("test1");
	const process2 = new Process("test2");
	const preflight = new PreflightStep(process1);
	const step = new ProcessStep(process2);

	it("setExtract", () => {
		const errorHandler = () => new Response(300, "test", 11);
		const extract = {};
		duplose.setExtract(extract, errorHandler);

		expect(duplose.extractError).toBe(errorHandler);
		expect(duplose.extract).toBe(extract);
	});

	it("addPreflight", () => {
		duplose.addPreflightSteps(preflight);

		expect(duplose.preflightSteps[0]).toBe(preflight);
	});

	it("addStep", () => {
		duplose.addStep(step);

		expect(duplose.steps[0]).toBe(step);
	});

	it("getAllHooks", () => {
		const hooks = duplose.getAllHooks();

		getTypedEntries(hooks)
			.forEach(([key, value]) => {
				if (!(value instanceof Hook)) {
					return;
				}

				expect(value.subscribers[0])
					.toBe(duplose.hooks[key]);

				expect((value.subscribers[1] as Hook).subscribers[0])
					.toBe(process2.hooks[key]);

				expect((value.subscribers[2] as Hook).subscribers[0])
					.toBe(process1.hooks[key]);
			});
	});
});

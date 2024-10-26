import { Duplose } from ".";
import { Process } from "./process";
import { ProcessStep } from "@scripts/step/process";
import { getTypedEntries } from "@utils/getTypedEntries";
import { Response } from "@scripts/response";
import { PreflightStep } from "@scripts/step/preflight";
import { Hook } from "@scripts/hook";
import { zod } from "@scripts/parser";
import { ZodAcceleratorParser } from "@duplojs/zod-accelerator";
import { insertBlock } from "@utils/stringBuilder";
import { InjectBlockNotfoundError } from "@scripts/error/injectBlockNotfoundError";

describe("Duplose", () => {
	class SubDuplo extends Duplose {
		public build() {
			return Promise.reject(new Error("Method not implemented."));
		}

		public get aef() {
			return this.applyEditingFunctions;
		}

		public get ae() {
			return this.acceleratedExtract;
		}

		public resetEditingFunction() {
			this.editingFunctions = [];
		}
	}

	const duplose = new SubDuplo();
	const process1 = new Process("test1");
	const process2 = new Process("test2");
	const preflight = new PreflightStep(process1);
	const step = new ProcessStep(process2);

	it("setExtract", () => {
		const errorHandler = () => new Response(300, "test", 11);
		const extract = {
			body: zod.string(),
			params: {
				userId: zod.number(),
			},
		};
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

	it("acceleratedExtract", () => {
		const acceleratedExtact: any = duplose.ae();

		expect(acceleratedExtact).not.toBe(undefined);
		expect(acceleratedExtact.body).instanceOf(ZodAcceleratorParser);
		expect(acceleratedExtact.params.userId).instanceOf(ZodAcceleratorParser);
	});

	it("injectCode", () => {
		duplose.edition.injectCode(
			"(ttt)",
			"let toto = 1;",
			"top",
		);

		expect(() => duplose.aef(insertBlock("test"))).toThrowError(InjectBlockNotfoundError);

		duplose.resetEditingFunction();

		duplose.edition.injectCode(
			"test",
			"let toto = 1;",
			"top",
		);

		duplose.edition.injectCode(
			"test",
			"toto = 2;",
			"first",
		);

		duplose.edition.injectCode(
			"test",
			"toto = 3;",
			"last",
		);

		duplose.edition.injectCode(
			"test",
			"toto = 4;",
			"bottom",
		);

		expect(duplose.aef(insertBlock("test"))).toMatchSnapshot();
	});

	it("injectFunction", () => {
		duplose.edition.injectFunction(
			"test",
			() => void "",
			"top",
		);

		expect(duplose.aef(insertBlock("test"))).toMatchSnapshot();
	});

	it("addExtensions", () => {
		expect(() => void duplose.edition.addExtensions({ injectedFunction: [] }))
			.toThrowError(Error);

		duplose.edition.addExtensions({ test: "toto" });

		expect(duplose.extensions.test)
			.toBe("toto");
	});

	it("hasDuplose", () => {
		expect(duplose.hasDuplose(new Process("process"))).toBe(false);
		expect(duplose.hasDuplose(new Process("process"), 0)).toBe(false);
		expect(duplose.hasDuplose(process1)).toBe(true);
		expect(duplose.hasDuplose(process2)).toBe(true);
	});
});

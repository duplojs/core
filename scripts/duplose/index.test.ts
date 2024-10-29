import { Duplose } from ".";
import { Process } from "./process";
import { ProcessStep } from "@scripts/step/process";
import { getTypedEntries } from "@utils/getTypedEntries";
import { PreflightStep } from "@scripts/step/preflight";
import { Hook } from "@scripts/hook";
import { insertBlock } from "@utils/stringBuilder";
import { InjectBlockNotfoundError } from "@scripts/error/injectBlockNotfoundError";
import { createProcessDefinition } from "@test/utils/manualDuplose";

describe("Duplose", () => {
	class SubDuplo extends Duplose {
		public build() {
			return Promise.reject(new Error("Method not implemented."));
		}

		public get aef() {
			return this.applyEditingFunctions;
		}

		public resetEditingFunction() {
			this.editingFunctions = [];
		}
	}

	const duplose = new SubDuplo({
		preflightSteps: [],
		steps: [],
		descriptions: [],
	});
	const process1 = new Process(createProcessDefinition());
	const process2 = new Process(createProcessDefinition());
	const preflight = new PreflightStep(process1);
	const step = new ProcessStep(process2);
	duplose.definiton.preflightSteps.push(preflight);
	duplose.definiton.steps.push(step);

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
		expect(duplose.hasDuplose(new Process(createProcessDefinition()))).toBe(false);
		expect(duplose.hasDuplose(new Process(createProcessDefinition()), 0)).toBe(false);
		expect(duplose.hasDuplose(process1)).toBe(true);
		expect(duplose.hasDuplose(process2)).toBe(true);
	});
});

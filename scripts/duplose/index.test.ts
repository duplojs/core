import { Duplose } from ".";
import { Process } from "./process";
import { ProcessStep } from "@scripts/step/process";
import { InjectBlockNotfoundError } from "@scripts/error/injectBlockNotfoundError";
import { createProcessDefinition } from "@test/utils/manualDuplose";
import { insertBlock } from "@utils/stringBuilder";

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
		steps: [],
		descriptions: [],
	});
	const process2 = new Process(createProcessDefinition());
	const step = new ProcessStep(process2);
	duplose.definiton.steps.push(step);

	const content = `\n${insertBlock("test")}\n`;

	it("injectCode", () => {
		duplose.edition.injectCode(
			"(ttt)",
			"let toto = 1;",
			"top",
		);

		expect(() => duplose.aef(content)).toThrowError(InjectBlockNotfoundError);

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

		expect(duplose.aef(content)).toMatchSnapshot();
	});

	it("injectFunction", () => {
		duplose.edition.injectFunction(
			"test",
			() => void "",
			"top",
		);

		expect(duplose.aef(content)).toMatchSnapshot();
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
		expect(duplose.hasDuplose(process2)).toBe(true);
	});
});

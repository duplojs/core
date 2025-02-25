import { createProcessDefinition } from "@test/utils/manualDuplose";
import { HttpDuplose } from "./http";
import { Process } from "./process";
import { ProcessStep } from "@scripts/step/process";
import { getTypedEntries } from "@duplojs/utils";
import { Hook } from "@scripts/hook";

describe("HttpDuplose", () => {
	class SubDuplo extends HttpDuplose {
		public build() {
			return Promise.reject(new Error("Method not implemented."));
		}
	}

	const duplose = new SubDuplo({
		steps: [],
		descriptions: [],
	});
	const process2 = new Process(createProcessDefinition());
	const step = new ProcessStep(process2);
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
			});
	});

	it("add hook", () => {
		const fnc = () => void undefined;
		duplose.hook("afterSend", fnc);

		expect(duplose.hooks.afterSend.subscribers[0])
			.toBe(fnc);
	});
});

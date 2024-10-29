import { Process } from "@scripts/duplose/process";
import { LastStepMustBeHandlerError } from "./lastStepMustBeHandlerError";
import { createProcessDefinition } from "@test/utils/manualDuplose";

it("lastStepMustBeHandlerError", () => {
	const process = new Process(createProcessDefinition());
	const error = new LastStepMustBeHandlerError(process);

	expect(error).instanceOf(Error);
	expect(error.duplose).toBe(process);
});

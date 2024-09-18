import { Process } from "@scripts/duplose/process";
import { LastStepMustBeHandlerError } from "./lastStepMustBeHandlerError";

it("lastStepMustBeHandlerError", () => {
	const process = new Process("test");
	const error = new LastStepMustBeHandlerError(process);

	expect(error).instanceOf(Error);
	expect(error.duplose).toBe(process);
});

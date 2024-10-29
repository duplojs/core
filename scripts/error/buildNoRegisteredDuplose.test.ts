import { Process } from "@scripts/duplose/process";
import { BuildNoRegisteredDuploseError } from "./buildNoRegisteredDuplose";
import { createProcessDefinition } from "@test/utils/manualDuplose";

it("buildNoRegisteredDuplose", () => {
	const process = new Process(createProcessDefinition());
	const error = new BuildNoRegisteredDuploseError(process);

	expect(error).instanceOf(Error);
	expect(error.duplose).toBe(process);
});

import { Process } from "@scripts/duplose/process";
import { BuildNoRegisteredDuploseError } from "./buildNoRegisteredDuplose";

it("buildNoRegisteredDuplose", () => {
	const process = new Process("test");
	const error = new BuildNoRegisteredDuploseError(process);

	expect(error).instanceOf(Error);
	expect(error.duplose).toBe(process);
});

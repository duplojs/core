import { InjectBlockNotfoundError } from "./injectBlockNotfoundError";
import { manualProcess } from "@test/utils/manualDuplose";
import { Duplose } from "@scripts/duplose";

it("InjectBlockNotfoundError", () => {
	const error = new InjectBlockNotfoundError(
		"toto",
		manualProcess,
	);

	expect(error).instanceOf(Error);
	expect(error.blockName).toBe("toto");
	expect(error.duplose).instanceOf(Duplose);
});

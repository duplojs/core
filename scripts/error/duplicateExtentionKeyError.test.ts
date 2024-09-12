import { DuplicateExtentionkeyError } from "./duplicateExtentionKeyError";
import { manualProcess } from "@test/utils/manualDuplose";
import { Duplose } from "@scripts/duplose";

it("DuplicateExtentionkeyError", () => {
	const error = new DuplicateExtentionkeyError(
		"toto",
		manualProcess,
	);

	expect(error).instanceOf(Error);
	expect(error.duplicateKey).toBe("toto");
	expect(error.duplose).instanceOf(Duplose);
});

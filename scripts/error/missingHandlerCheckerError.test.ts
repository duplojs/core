import { manualChecker } from "@test/utils/manualDuplose";
import { MissingHandlerCheckerError } from "./missingHandlerCheckerError";

it("missingHandlerCheckerError", () => {
	const error = new MissingHandlerCheckerError(manualChecker);

	expect(error).instanceOf(Error);
	expect(error.checker).toBe(manualChecker);
});

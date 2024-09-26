import type { ZodErrorMap } from "zod";
import { zod } from ".";

interface CoerceBooleanParams {
	errorMap?: ZodErrorMap | undefined;
	invalid_type_error?: string | undefined;
	required_error?: string | undefined;
	message?: string | undefined;
	description?: string | undefined;
}

export function booleanInString(params?: CoerceBooleanParams) {
	return zod.enum(["true", "false"], params).transform((value) => value === "true");
}

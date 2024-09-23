import type { ZodSpace } from "@scripts/parser";
import type { PresetGenericResponse } from "@scripts/response";

export class ContractResponseError extends Error {
	public constructor(
		public zodError: ZodSpace.ZodError,
		public response: PresetGenericResponse,
	) {
		super("Data returned isn't matching to zod schema.");
	}
}

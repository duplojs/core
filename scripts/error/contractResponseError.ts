import type { zodSpace } from "@scripts/zod";
import type { Response } from "@scripts/response";

export class ContractResponseError extends Error {
	public constructor(
		public zodError: zodSpace.ZodError,
		public response: Response,
	) {
		super("Data returned isn't matching to zod schema.");
	}
}

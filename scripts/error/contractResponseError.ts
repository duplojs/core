import type { ZodError } from "zod";
import type { Response } from "@scripts/response";

export class ContractResponseError extends Error {
	public constructor(
		public zodError: ZodError,
		public reponse: Response,
	) {
		super("Data returned isn't matching to zod schema.");
	}
}

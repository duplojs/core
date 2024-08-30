import { ZodError } from "zod";
import { Response } from "@scripts/response";
import { ContractResponseError } from "./contractResponseError";

it("ContractResponseError", () => {
	const error = new ContractResponseError(
		new ZodError([]),
		new Response(200, "ok", undefined),
	);

	expect(error).instanceOf(Error);
	expect(error.zodError).instanceOf(ZodError);
	expect(error.reponse).instanceOf(Response);
});

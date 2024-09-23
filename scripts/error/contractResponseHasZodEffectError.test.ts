import { ContractResponseHasZodEffectError } from "./contractResponseHasZodEffectError";

it("ContractResponseHasZodEffectError", () => {
	const error = new ContractResponseHasZodEffectError();

	expect(error).instanceOf(Error);
});

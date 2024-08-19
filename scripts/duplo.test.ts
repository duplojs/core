import { ZodError } from "zod";
import { Duplo } from "./duplo";
import { Process } from "./duplose/process";
import { Response } from "@scripts/response";

describe("duplo", () => {
	const duplo = new Duplo();

	it("register duplo", () => {
		const process = new Process("test");
		duplo.register(process);

		expect(process.instance).toBe(duplo);
	});

	it("extractError", () => {
		const response = duplo.extractError("params", "userId", new ZodError([]));

		expect(response).instanceOf(Response);
		expect(response.code).toBe(422);
		expect(response.information).toBe("TYPE_ERROR.params.userId");
		expect(response.body).instanceOf(ZodError);
	});
});

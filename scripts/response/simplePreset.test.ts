import { Response } from ".";
import * as simplePreset from "./simplePreset";

it("simplePreset", () => {
	Object.values(simplePreset)
		.forEach((Res) => {
			const response = new Res("test", 12345);

			expect(response).instanceof(Response);
			expect(response.code).toBe(Res.code);
			expect(response.information).toBe("test");
			expect(response.body).toBe(12345);
		});
});

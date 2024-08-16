import { Response } from ".";
import { MultipleChoicesHttpResponse, RedirectHttpResponse, NoContentHttpResponse, MovedPermanentlyHttpResponse, FoundHttpResponse, SeeOtherHttpResponse, NotModifiedHttpResponse, TemporaryRedirectHttpResponse, PermanentRedirectHttpResponse } from "./advancedPreset";

describe("advancedPreset", () => {
	it("NoContentHttpResponse", () => {
		const response = new NoContentHttpResponse("test");

		expect(response).instanceof(Response);
		expect(response.code).toBe(NoContentHttpResponse.code);
		expect(response.information).toBe("test");
	});

	it("RedirectHttpResponse", () => {
		[
			MultipleChoicesHttpResponse,
			MultipleChoicesHttpResponse,
			MovedPermanentlyHttpResponse,
			FoundHttpResponse,
			SeeOtherHttpResponse,
			NotModifiedHttpResponse,
			TemporaryRedirectHttpResponse,
			PermanentRedirectHttpResponse,
		].forEach((Res) => {
			const response = new Res("test", "/monSuperUrl");

			expect(response).instanceof(RedirectHttpResponse);
			expect(response.code).toBe(Res.code);
			expect(response.information).toBe("test");
			expect(response.headers.Location).toBe("/monSuperUrl");
		});
	});
});

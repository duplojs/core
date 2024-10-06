import { Response } from ".";
import { MultipleChoicesHttpResponse, RedirectHttpResponse, NoContentHttpResponse, MovedPermanentlyHttpResponse, FoundHttpResponse, SeeOtherHttpResponse, NotModifiedHttpResponse, TemporaryRedirectHttpResponse, PermanentRedirectHttpResponse, DownloadFileHttpResponse } from "./advancedPreset";
import { File } from "@utils/file";

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

	it("DownloadFileHttpResponse", () => {
		const response = new DownloadFileHttpResponse("test", new File("/test.png"));

		expect(response.headers).toStrictEqual({
			"content-type": "application/octet-stream",
			"Content-Disposition": "attachment; filename=test.png",
		});
		expect(response.body).instanceof(File);
	});
});

import type { File } from "@utils/file";
import { Response } from ".";
import { OkHttpResponse } from "./simplePreset";

export class NoContentHttpResponse<
	Information extends string | undefined = undefined,
> extends Response<typeof NoContentHttpResponse.code, Information, undefined> {
	public constructor(info: Information) {
		super(NoContentHttpResponse.code, info, undefined);
	}

	public static readonly code = 204;
}

export abstract class RedirectHttpResponse<
	Code extends number = number,
	Information extends string | undefined = undefined,
> extends Response<Code, Information, undefined> {
	public constructor(code: Code, info: Information, url: string) {
		super(code, info, undefined);
		this.headers.Location = url;
	}
}

export class MultipleChoicesHttpResponse<
	Information extends string | undefined = undefined,
> extends RedirectHttpResponse<typeof MultipleChoicesHttpResponse.code, Information> {
	public constructor(info: Information, url: string) {
		super(MultipleChoicesHttpResponse.code, info, url);
	}

	public static readonly code = 300;
}

export class MovedPermanentlyHttpResponse<
	Information extends string | undefined = undefined,
> extends RedirectHttpResponse<typeof MovedPermanentlyHttpResponse.code, Information> {
	public constructor(info: Information, url: string) {
		super(MovedPermanentlyHttpResponse.code, info, url);
	}

	public static readonly code = 301;
}

export class FoundHttpResponse<
	Information extends string | undefined = undefined,
> extends RedirectHttpResponse<typeof FoundHttpResponse.code, Information> {
	public constructor(info: Information, url: string) {
		super(FoundHttpResponse.code, info, url);
	}

	public static readonly code = 302;
}

export class SeeOtherHttpResponse<
	Information extends string | undefined = undefined,
> extends RedirectHttpResponse<typeof SeeOtherHttpResponse.code, Information> {
	public constructor(info: Information, url: string) {
		super(SeeOtherHttpResponse.code, info, url);
	}

	public static readonly code = 303;
}

export class NotModifiedHttpResponse<
	Information extends string | undefined = undefined,
> extends RedirectHttpResponse<typeof NotModifiedHttpResponse.code, Information> {
	public constructor(info: Information, url: string) {
		super(NotModifiedHttpResponse.code, info, url);
	}

	public static readonly code = 304;
}

export class TemporaryRedirectHttpResponse<
	Information extends string | undefined = undefined,
> extends RedirectHttpResponse<typeof TemporaryRedirectHttpResponse.code, Information> {
	public constructor(info: Information, url: string) {
		super(TemporaryRedirectHttpResponse.code, info, url);
	}

	public static readonly code = 307;
}

export class PermanentRedirectHttpResponse<
	Information extends string | undefined = undefined,
> extends RedirectHttpResponse<typeof PermanentRedirectHttpResponse.code, Information> {
	public constructor(info: Information, url: string) {
		super(PermanentRedirectHttpResponse.code, info, url);
	}

	public static readonly code = 308;
}

export class SendFileHttpResponse<
	Information extends string | undefined = undefined,
> extends OkHttpResponse<Information, File> {
	public constructor(info: Information, public file: File, mineType?: string) {
		super(info, file);

		this.headers["content-type"] = mineType ?? file.informations.mimeType ?? "text/plain; charset=utf-8";
	}
}

export class DownloadFileHttpResponse<
	Information extends string | undefined = undefined,
> extends OkHttpResponse<Information, File> {
	public constructor(info: Information, public file: File, name?: string) {
		super(info, file);

		this.headers["content-type"] = "application/octet-stream";
		this.headers["Content-Disposition"] = `attachment; filename=${name || file.informations.name}`;
	}
}

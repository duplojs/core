/* eslint-disable max-classes-per-file */
import { Response } from ".";

export class MultipleChoicesHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = unknown,
> extends Response<typeof MultipleChoicesHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body) {
		super(MultipleChoicesHttpResponse.code, info, body);
	}

	public static readonly code = 300;
}

export class MovedPermanentlyHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = unknown,
> extends Response<typeof MovedPermanentlyHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body) {
		super(MovedPermanentlyHttpResponse.code, info, body);
	}

	public static readonly code = 301;
}

export class FoundHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = unknown,
> extends Response<typeof FoundHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body) {
		super(FoundHttpResponse.code, info, body);
	}

	public static readonly code = 302;
}

export class SeeOtherHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = unknown,
> extends Response<typeof SeeOtherHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body) {
		super(SeeOtherHttpResponse.code, info, body);
	}

	public static readonly code = 303;
}

export class NotModifiedHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = unknown,
> extends Response<typeof NotModifiedHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body) {
		super(NotModifiedHttpResponse.code, info, body);
	}

	public static readonly code = 304;
}

export class TemporaryRedirectHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = unknown,
> extends Response<typeof TemporaryRedirectHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body) {
		super(TemporaryRedirectHttpResponse.code, info, body);
	}

	public static readonly code = 307;
}

export class PermanentRedirectHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = unknown,
> extends Response<typeof PermanentRedirectHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body) {
		super(PermanentRedirectHttpResponse.code, info, body);
	}

	public static readonly code = 308;
}

import { Response } from ".";

export class OkHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof OkHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(OkHttpResponse.code, info, body);
	}

	public static readonly code = 200;
}

export class CreatedHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof CreatedHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(CreatedHttpResponse.code, info, body);
	}

	public static readonly code = 201;
}

export class AcceptedHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof AcceptedHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(AcceptedHttpResponse.code, info, body);
	}

	public static readonly code = 202;
}

export class ResetContentHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof ResetContentHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(ResetContentHttpResponse.code, info, body);
	}

	public static readonly code = 205;
}

export class PartialContentHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof PartialContentHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(PartialContentHttpResponse.code, info, body);
	}

	public static readonly code = 206;
}

export class BadRequestHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof BadRequestHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(BadRequestHttpResponse.code, info, body);
	}

	public static readonly code = 400;
}

export class UnauthorizedHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof UnauthorizedHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(UnauthorizedHttpResponse.code, info, body);
	}

	public static readonly code = 401;
}

export class ForbiddenHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof ForbiddenHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(ForbiddenHttpResponse.code, info, body);
	}

	public static readonly code = 403;
}

export class NotFoundHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof NotFoundHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(NotFoundHttpResponse.code, info, body);
	}

	public static readonly code = 404;
}

export class MethodNotAllowedHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof MethodNotAllowedHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(MethodNotAllowedHttpResponse.code, info, body);
	}

	public static readonly code = 405;
}

export class NotAcceptableHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof NotAcceptableHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(NotAcceptableHttpResponse.code, info, body);
	}

	public static readonly code = 406;
}

export class ProxyAuthenticationRequiredHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof ProxyAuthenticationRequiredHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(ProxyAuthenticationRequiredHttpResponse.code, info, body);
	}

	public static readonly code = 407;
}

export class RequestTimeoutHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof RequestTimeoutHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(RequestTimeoutHttpResponse.code, info, body);
	}

	public static readonly code = 408;
}

export class ConflictHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof ConflictHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(ConflictHttpResponse.code, info, body);
	}

	public static readonly code = 409;
}

export class GoneHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof GoneHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(GoneHttpResponse.code, info, body);
	}

	public static readonly code = 410;
}

export class LengthRequiredHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof LengthRequiredHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(LengthRequiredHttpResponse.code, info, body);
	}

	public static readonly code = 411;
}

export class PreconditionFailedHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof PreconditionFailedHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(PreconditionFailedHttpResponse.code, info, body);
	}

	public static readonly code = 412;
}

export class PayloadTooLargeHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof PayloadTooLargeHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(PayloadTooLargeHttpResponse.code, info, body);
	}

	public static readonly code = 413;
}

export class UriTooLongHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof UriTooLongHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(UriTooLongHttpResponse.code, info, body);
	}

	public static readonly code = 414;
}

export class UnsupportedMediaTypeHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof UnsupportedMediaTypeHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(UnsupportedMediaTypeHttpResponse.code, info, body);
	}

	public static readonly code = 415;
}

export class RangeNotSatisfiableHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof RangeNotSatisfiableHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(RangeNotSatisfiableHttpResponse.code, info, body);
	}

	public static readonly code = 416;
}

export class ExpectationFailedHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof ExpectationFailedHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(ExpectationFailedHttpResponse.code, info, body);
	}

	public static readonly code = 417;
}

export class ImATeapotHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof ImATeapotHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(ImATeapotHttpResponse.code, info, body);
	}

	public static readonly code = 418;
}

export class UnprocessableEntityHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof UnprocessableEntityHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(UnprocessableEntityHttpResponse.code, info, body);
	}

	public static readonly code = 422;
}

export class UpgradeRequiredHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof UpgradeRequiredHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(UpgradeRequiredHttpResponse.code, info, body);
	}

	public static readonly code = 426;
}

export class PreconditionRequiredHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof PreconditionRequiredHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(PreconditionRequiredHttpResponse.code, info, body);
	}

	public static readonly code = 428;
}

export class TooManyRequestsHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof TooManyRequestsHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(TooManyRequestsHttpResponse.code, info, body);
	}

	public static readonly code = 429;
}

export class RequestHeaderFieldsTooLargeHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof RequestHeaderFieldsTooLargeHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(RequestHeaderFieldsTooLargeHttpResponse.code, info, body);
	}

	public static readonly code = 431;
}

export class UnavailableForLegalReasonsHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof UnavailableForLegalReasonsHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(UnavailableForLegalReasonsHttpResponse.code, info, body);
	}

	public static readonly code = 451;
}

export class InternalServerErrorHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof InternalServerErrorHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(InternalServerErrorHttpResponse.code, info, body);
	}

	public static readonly code = 500;
}

export class NotImplementedHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof NotImplementedHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(NotImplementedHttpResponse.code, info, body);
	}

	public static readonly code = 501;
}

export class BadGatewayHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof BadGatewayHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(BadGatewayHttpResponse.code, info, body);
	}

	public static readonly code = 502;
}

export class ServiceUnavailableHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof ServiceUnavailableHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(ServiceUnavailableHttpResponse.code, info, body);
	}

	public static readonly code = 503;
}

export class GatewayTimeoutHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof GatewayTimeoutHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(GatewayTimeoutHttpResponse.code, info, body);
	}

	public static readonly code = 504;
}

export class HttpVersionNotSupportedHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof HttpVersionNotSupportedHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(HttpVersionNotSupportedHttpResponse.code, info, body);
	}

	public static readonly code = 505;
}

export class VariantAlsoNegotiatesHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof VariantAlsoNegotiatesHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(VariantAlsoNegotiatesHttpResponse.code, info, body);
	}

	public static readonly code = 506;
}

export class NotExtendedHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof NotExtendedHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(NotExtendedHttpResponse.code, info, body);
	}

	public static readonly code = 510;
}

export class NetworkAuthenticationRequiredHttpResponse<
	Information extends string | undefined = undefined,
	Body extends unknown = undefined,
> extends Response<typeof NetworkAuthenticationRequiredHttpResponse.code, Information, Body> {
	public constructor(info: Information, body: Body = undefined as Body) {
		super(NetworkAuthenticationRequiredHttpResponse.code, info, body);
	}

	public static readonly code = 511;
}

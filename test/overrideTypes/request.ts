/* eslint-disable no-unused-vars */

import { CurrentRequestObject, HttpMethod } from "@scripts/request";
import { ExpectType } from "@utils/expectType";

declare module "@scripts/request" {
	interface RequestObject {
		override: string;
	}

	interface HttpMethods {
		TRACE: true;
	}
}

type CheckOverrideRequestObject = ExpectType<string, CurrentRequestObject>;

type CheckNewHttpMethod = ExpectType<HttpMethod, "TRACE">;

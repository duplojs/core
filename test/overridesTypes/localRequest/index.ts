import { type ExpectType } from "@duplojs/utils";
import { createProcess, OkHttpResponse, useBuilder, type Request } from "@scripts/index";

const process1 = createProcess<Request & { test1: string }>("process1")
	.cut(({ dropper }, request) => {
		type check = ExpectType<
			typeof request,
			Request & { test1: string },
			"strict"
		>;

		return dropper(null);
	})
	.exportation();

const process2 = createProcess<Request & { test2: string }>("process2")
	.cut(({ dropper }, request) => {
		type check = ExpectType<
			typeof request,
			Request & { test2: string },
			"strict"
		>;

		return dropper(null);
	})
	.exportation();

useBuilder<Request & { test3: string }>()
	.preflight(process1)
	.createRoute("GET", "")
	.cut(({ dropper }, request) => {
		type check = ExpectType<
			typeof request,
			Request & {
				test3: string;
			} & {
				test1: string;
			},
			"strict"
		>;

		return dropper(null);
	})
	.execute(process2)
	.handler((pickup, request) => {
		type check = ExpectType<
			typeof request,
			Request & {
				test3: string;
			} & {
				test1: string;
			} & {
				test2: string;
			},
			"strict"
		>;

		return new OkHttpResponse(undefined);
	});

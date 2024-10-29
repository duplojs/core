import { OkHttpResponse, useBuilder, type Request } from "@scripts/index";
import type { ExpectType } from "@test/utils/expectType";

const process1 = useBuilder<Request & { test1: string }>()
	.createProcess("process1")
	.cut(({ dropper }, request) => {
		type check = ExpectType<
			typeof request,
			Request & { test1: string },
			"strict"
		>;

		return dropper(null);
	})
	.exportation();

const process2 = useBuilder()
	.createProcess<Request & { test2: string }>("process2")
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

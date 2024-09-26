import { Duplo, type Request } from "@duplojs/core";
import type { ExpectType } from "@test/expectType";

export const duplo = new Duplo({
	environment: "TEST",
});

duplo.hook("beforeRouteExecution", (request) => {
	type check = ExpectType<typeof request, Request, "strict">;
});

duplo.hook("onError", (request) => {
	type check = ExpectType<typeof request, Request, "strict">;
});

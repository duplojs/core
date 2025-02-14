import { Duplo, Route, type Request, type globalValues } from "@duplojs/core";
import { type ExpectType } from "@duplojs/utils";

export const duplo = new Duplo({
	environment: "TEST",
});

duplo.hook("beforeRouteExecution", (request) => {
	type check = ExpectType<typeof request, Request, "strict">;
});

duplo.hook("onError", (request) => {
	type check = ExpectType<typeof request, Request, "strict">;
});

type globalChek = ExpectType<
	keyof Pick<typeof globalThis, keyof typeof globalValues>,
	keyof typeof globalValues,
	"strict"
>;

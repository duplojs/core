/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { CurrentRequestObject } from "@scripts/request";
import { type BuildHooks, Hook } from ".";
import type { Duplo } from "@scripts/duplo";
import type { Duplose } from "@scripts/duplose";
import { HooksLifeCycle } from "./lifeCycle";
import { type MybePromise } from "@duplojs/utils";

export class HooksInstanceifeCycle extends HooksLifeCycle {
	public onStart = new Hook<(duplo: Duplo) => MybePromise<boolean | void>>(1);

	public onHttpServerError
		= new Hook<(request: CurrentRequestObject, error: unknown) => MybePromise<boolean | void>>(2);

	public onRegistered = new Hook<(duplose: Duplose) => boolean | void>(1);

	public beforeBuildRouter = new Hook<(duplose: Duplo) => MybePromise<boolean | void>>(1);
}

export type BuildedHooksInstanceLifeCycle = Omit<
	BuildHooks<HooksInstanceifeCycle>,
	keyof HooksLifeCycle
>;

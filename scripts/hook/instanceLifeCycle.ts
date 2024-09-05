import type { CurrentRequestObject } from "@scripts/request";
import { type BuildHooks, Hook } from ".";
import type { Duplo } from "@scripts/duplo";
import type { Duplose } from "@scripts/duplose";
import type { PromiseOrNot } from "@utils/types";
import { HooksLifeCycle } from "./lifeCycle";

export class HooksInstanceifeCycle extends HooksLifeCycle {
	public onStart = new Hook<(duplo: Duplo) => PromiseOrNot<boolean | void>>(1);

	public onHttpServerError
		= new Hook<(request: CurrentRequestObject, error: unknown) => PromiseOrNot<boolean | void>>(2);

	public onRegistered = new Hook<(duplose: Duplose) => boolean | void>(1);

	public beforeBuildRouter = new Hook<(duplose: Duplo) => PromiseOrNot<boolean | void>>(1);
}

export type BuildedHooksInstanceLifeCycle = Omit<
	BuildHooks<HooksInstanceifeCycle>,
	keyof HooksLifeCycle
>;

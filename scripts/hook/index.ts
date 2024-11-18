import type { AnyFunction } from "@utils/types";
import type { HooksRouteLifeCycle } from "./routeLifeCycle";
import type { HooksInstanceifeCycle } from "./instanceLifeCycle";
import { Evaler, type EvalerParams } from "@scripts/evaler";

export interface HookEvalerParams extends EvalerParams {
	hook: Hook;
}

export class HookEvaler extends Evaler<HookEvalerParams> {

}

export class Hook<
	subscriber extends AnyFunction = AnyFunction,
> {
	private numberArgs: number;

	public subscribers: (subscriber | Hook<subscriber>)[] = [];

	public evaler?: HookEvaler;

	public constructor(numberArgs: Parameters<subscriber>["length"]) {
		this.numberArgs = numberArgs;
	}

	public addSubscriber(
		...subscribers: (subscriber | Hook<subscriber>)[]
	) {
		this.subscribers.push(...subscribers);
	}

	public removeSubscriber(subscriber: subscriber | Hook<subscriber>) {
		const index = this.subscribers.findIndex((sub) => sub === subscriber);
		if (index !== -1) {
			this.subscribers.splice(index, 1);
		}
	}

	public removeAllSubscriber() {
		this.subscribers = [];
	}

	public launchSubscriber(...args: Parameters<subscriber>): Awaited<ReturnType<subscriber>> | undefined {
		for (const subscriber of this.subscribers) {
			const result = subscriber instanceof Hook
				? subscriber.launchSubscriber(...args)
				: subscriber(...args);

			if (result) {
				return result;
			}
		}
	}

	public async launchSubscriberAsync(
		...args: Parameters<subscriber>
	): Promise<Awaited<ReturnType<subscriber>> | undefined> {
		for (const subscriber of this.subscribers) {
			const result = subscriber instanceof Hook
				? await subscriber.launchSubscriberAsync(...args)
				: await subscriber(...args);

			if (result) {
				return result;
			}
		}
	}

	public hasSubscriber(subscriber: subscriber | Hook) {
		return !!this.subscribers.find((fnc) => fnc === subscriber);
	}

	public getFlatSubscribers(): subscriber[] {
		return this.subscribers.flatMap(
			(subscriber) => typeof subscriber === "function"
				? subscriber
				: subscriber.getFlatSubscribers(),
		);
	}

	public build() {
		const subscribers = this.getFlatSubscribers();

		const mapArgs = new Array(this.numberArgs).fill(undefined)
			.map((_v, index) => `arg${index}`)
			.join(", ");

		const functionContent = subscribers.map((fnc, index) => /* js */`
			result = ${(fnc.constructor.name === "AsyncFunction" ? "await " : "")}this.subscribers[${index}](${mapArgs})
			if(result) {
				return result;
			}
		`).join("");

		const evaler = this.evaler ?? Hook.defaultEvaler;

		return evaler.makeFunction<subscriber>({
			hook: this,
			content: `let result;\n${functionContent}`,
			args: [mapArgs],
			bind: { subscribers },
		});
	}

	protected static readonly defaultEvaler = new HookEvaler();
}

export type Hooks = HooksRouteLifeCycle<any> | HooksInstanceifeCycle;

export type BuildHooks<T extends Hooks> = {
	[P in keyof T]: T[P] extends Hook<infer InferedSubscriber>
		? InferedSubscriber
		: never
};

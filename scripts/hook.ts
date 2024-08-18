import { advancedEval } from "@utils/advancedEval";
import type { AnyFunction, PromiseOrNot } from "@utils/types";
import type { CurrentRequestObject } from "./request";
import type { Response } from "./response";

export class Hook<
	subscriber extends AnyFunction = AnyFunction,
> {
	private numberArgs: number;

	public subscribers: (subscriber | Hook<subscriber>)[] = [];

	public constructor(numberArgs: Parameters<subscriber>["length"]) {
		this.numberArgs = numberArgs;
	}

	public addSubscriber(
		subscriber: subscriber | Hook<subscriber>,
		...subscribers: (subscriber | Hook<subscriber>)[]
	) {
		this.subscribers.push(subscriber, ...subscribers);
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

	public launchSubscriber(...args: Parameters<subscriber>): boolean | void {
		for (const subscriber of this.subscribers) {
			if (subscriber instanceof Hook) {
				if (subscriber.launchSubscriber(...args) === true) {
					return true;
				}
			} else if (subscriber(...args) === true) {
				return true;
			}
		}
	}

	public async launchSubscriberAsync(...args: Parameters<subscriber>): Promise<boolean | void> {
		for (const subscriber of this.subscribers) {
			if (subscriber instanceof Hook) {
				if (await subscriber.launchSubscriberAsync(...args) === true) {
					return true;
				}
			} else if (await subscriber(...args) === true) {
				return true;
			}
		}
	}

	public hasSubscriber(subscriber: subscriber | Hook<subscriber>) {
		return !!this.subscribers.find((fnc) => fnc === subscriber);
	}

	public build() {
		const subscribers = this.flatSubscribers();

		const mapArgs = new Array(this.numberArgs).fill(undefined)
			.map((_v, index) => `arg${index}`)
			.join(", ");

		const functionContent = subscribers.map((fnc, index) => /* js */`
			if(${(fnc.constructor.name === "AsyncFunction" ? "await " : "")}this.subscribers[${index}](${mapArgs}) === true) return;
		`).join("");

		return advancedEval<subscriber>({
			content: functionContent,
			args: [mapArgs],
			bind: { subscribers },
		});
	}

	private flatSubscribers(): subscriber[] {
		return this.subscribers.flatMap(
			(subscriber) => typeof subscriber === "function"
				? subscriber
				: subscriber.flatSubscribers(),
		);
	}
}

export type BuildHooks<T extends Record<string, Hook>> = {
	[P in keyof T]: ReturnType<T[P]["build"]>
};

export function copyHooks<
	T extends Record<string, Hook>,
>(
	base: T,
	copy: NoInfer<T>,
) {
	Object.keys(base).forEach((key) => {
		base[key].addSubscriber(
			copy[key],
		);
	});
}

export function makeHooksRouteLifeCycle<
	Request extends CurrentRequestObject = any,
>() {
	return {
		beforeRouteExecution: new Hook<(request: Request) => PromiseOrNot<boolean | Response | void>>(1),
		parsingBody: new Hook<(request: Request) => PromiseOrNot<boolean | Response | void>>(1),
		onError: new Hook<(request: Request, error: unknown) => PromiseOrNot<boolean | Response | void>>(2),
		beforeSend: new Hook<(request: Request, response: Response) => PromiseOrNot<boolean | void>>(2),
		serializeBody: new Hook<(request: Request, response: Response) => PromiseOrNot<boolean | void>>(2),
		afterSend: new Hook<(request: Request, response: Response) => PromiseOrNot<boolean | void>>(2),
	};
}

export type HooksRouteLifeCycle<
	Request extends CurrentRequestObject = any,
> = ReturnType<typeof makeHooksRouteLifeCycle<Request>>;

export type BuildedHooksRouteLifeCycle<
	Request extends CurrentRequestObject = any,
> = BuildHooks<HooksRouteLifeCycle<Request>>;


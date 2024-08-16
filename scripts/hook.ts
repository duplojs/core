import { advancedEval } from "@utils/advancedEval";
import type { AnyFunction, PromiseOrNot } from "@utils/types";
import type { CurrentRequestObject } from "./request";
import type { Response } from "./response";

export class Hook<
	args extends any[] = [],
	subscriber extends AnyFunction = (...args: args) => PromiseOrNot<boolean | void>,
> {
	private numberArgs: number;

	public subscribers: (subscriber | Hook<args, subscriber>)[] = [];

	public constructor(numberArgs: args["length"]) {
		this.numberArgs = numberArgs;
	}

	public addSubscriber(
		subscriber: subscriber | Hook<args, subscriber>,
		...subscribers: (subscriber | Hook<args, subscriber>)[]
	) {
		this.subscribers.push(subscriber, ...subscribers);
	}

	public removeSubscriber(subscriber: subscriber | Hook<args>) {
		const index = this.subscribers.findIndex((sub) => sub === subscriber);
		if (index !== -1) {
			this.subscribers.splice(index, 1);
		}
	}

	public removeAllSubscriber() {
		this.subscribers = [];
	}

	public launchSubscriber(...args: args): boolean | void {
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

	public async launchSubscriberAsync(...args: args): Promise<boolean | void> {
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

	public hasSubscriber(subscriber: subscriber | Hook<args, subscriber>) {
		return Boolean(this.subscribers.find((fnc) => fnc === subscriber));
	}

	public build(): subscriber {
		const subscribers = this.flatSubscribers();

		const mapArgs = new Array(this.numberArgs).fill(undefined)
			.map((_v, index) => `arg${index}`)
			.join(", ");

		const functionContent = subscribers.map((fnc, index) => /* js */`
			if(${(fnc.constructor.name === "AsyncFunction" ? "await " : "")}this.subscribers[${index}](${mapArgs}) === true) return;
		`).join("");

		return advancedEval({
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

export function makeHooksRouteLifeCycle<
	Request extends CurrentRequestObject = CurrentRequestObject,
>() {
	return {
		beforeRouteExecution: new Hook<[request: Request]>(1),
		parsingBody: new Hook<[request: Request]>(1),
		onError: new Hook<[request: Request, error: unknown]>(2),
		beforeSend: new Hook<[request: Request, response: Response]>(2),
		serializeBody: new Hook<[request: Request, response: Response]>(2),
		afterSend: new Hook<[request: Request, response: Response]>(2),
	};
}

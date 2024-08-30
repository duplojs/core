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

	public launchSubscriber(...args: Parameters<subscriber>): Awaited<ReturnType<subscriber>> | void {
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
	): Promise<Awaited<ReturnType<subscriber>> | void> {
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

		return advancedEval<subscriber>({
			content: `let result;\n${functionContent}`,
			args: [mapArgs],
			bind: { subscribers },
		});
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
		onError: new Hook<(request: Request, error: unknown) => PromiseOrNot<Response | void>>(2),
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

export type DefineHooksRouteLifeCycle<
	Request extends CurrentRequestObject = any,
	ReturnType extends unknown = undefined,
> = <
	T extends keyof BuildedHooksRouteLifeCycle<Request>,
>(hookName: T, subscriber: BuildedHooksRouteLifeCycle<Request>[T]) => ReturnType;

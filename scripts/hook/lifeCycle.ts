import { getTypedKeys } from "@duplojs/utils";
import { Hook } from ".";

export abstract class HooksLifeCycle {
	public import<
		T extends this,
	>(hooks: T, subscribers = false) {
		getTypedKeys(this)
			.forEach((key) => {
				const baseHook = this[key];
				const copyedHook = hooks[key];

				if (baseHook instanceof Hook && copyedHook instanceof Hook) {
					if (!subscribers) {
						baseHook.addSubscriber(
							copyedHook,
						);
					} else {
						baseHook.addSubscriber(
							...copyedHook.subscribers as never[],
						);
					}
				}
			});
	}

	public clone() {
		const clone = new (this.constructor as new () => this)();

		clone.import(this, true);

		return clone;
	}
}

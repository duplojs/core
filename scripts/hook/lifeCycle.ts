import { getTypedKeys } from "@utils/getTypedKeys";
import { Hook } from ".";

export abstract class HooksLifeCycle {
	public import<
		T extends this,
	>(hooks: T) {
		getTypedKeys(this).forEach((key) => {
			const baseHook = this[key];
			const copyedHook = hooks[key];

			if (baseHook instanceof Hook && copyedHook instanceof Hook) {
				baseHook.addSubscriber(
					copyedHook,
				);
			}
		});
	}
}

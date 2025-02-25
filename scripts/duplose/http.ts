import { type CurrentRequestObject } from "@scripts/request";
import { Duplose, type DuploseDefinition } from ".";
import { type BuildedHooksRouteLifeCycle, HooksRouteLifeCycle } from "@scripts/hook/routeLifeCycle";
import { type AnyFunction } from "@duplojs/utils";

export abstract class HttpDuplose<
	GenericDuploseDefinition extends DuploseDefinition = DuploseDefinition,
	GenericRequest extends CurrentRequestObject = any,
	GenericFloorData extends object = any,
> extends Duplose<
		GenericDuploseDefinition,
		GenericFloorData
	> {
	public hooks = new HooksRouteLifeCycle<GenericRequest>();

	public getAllHooks() {
		const hooks = new HooksRouteLifeCycle<GenericRequest>();

		hooks.import(this.hooks);

		this.definiton
			.steps
			.forEach((step) => {
				if (step.parent instanceof HttpDuplose) {
					hooks.import(step.parent.getAllHooks());
				}
			});

		return hooks;
	}

	public hook<
		T extends keyof BuildedHooksRouteLifeCycle<GenericRequest>,
	>(hookName: T, subscriber: BuildedHooksRouteLifeCycle<GenericRequest>[T]) {
		this.hooks[hookName].addSubscriber(subscriber as AnyFunction);

		return this;
	}
}

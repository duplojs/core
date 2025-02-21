import { type MybePromise } from "@duplojs/utils";
import { createRoute, Duplo, Route, Router, useRouteBuilder } from "@scripts/index";

export class DuploTest extends Duplo {
	public async start(onStart?: (duplo: Duplo) => MybePromise<void>) {
		const notfoundHandler = this.notfoundHandler;
		const notfoundRoute = createRoute("GET", ["/*"]).handler((pickup, request) => notfoundHandler(request));
		this.register(notfoundRoute);

		await this.hooksInstanceLifeCycle.beforeBuildRouter.launchSubscriber(this);

		const router = new Router(
			this,
			this.duploses.filter((duplose) => duplose instanceof Route),
			notfoundRoute,
		);

		this.buildedRouter = await router.build();

		if (onStart) {
			this.hooksInstanceLifeCycle.onStart.addSubscriber(onStart);
		}
		await this.hooksInstanceLifeCycle.onStart.launchSubscriber(this);

		return router;
	}
}

export const duploTest = new DuploTest({
	environment: "TEST",
});

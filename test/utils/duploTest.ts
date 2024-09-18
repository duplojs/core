import { Duplo, Route, Router, type PromiseOrNot } from "@scripts/index";

export class DuploTest extends Duplo {
	public async start(onStart?: (duplo: Duplo) => PromiseOrNot<void>) {
		await this.hooksInstanceLifeCycle.beforeBuildRouter.launchSubscriber(this);

		const router = new Router(
			this.duploses.filter((duplose) => duplose instanceof Route),
			this.createNotfoundRoute(),
		);

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

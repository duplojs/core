import { Hook, makeHooksRouteLifeCycle } from "./hook";

describe("hook", () => {
	const hook = new Hook<(test?: boolean) => any>(1);

	beforeEach(() => {
		hook.removeAllSubscriber();
	});

	it("add subscriber", () => {
		const fnc = () => undefined;

		expect(hook.hasSubscriber(fnc)).toBe(false);

		hook.addSubscriber(fnc);

		expect(hook.hasSubscriber(fnc)).toBe(true);
	});

	it("remove subscriber", () => {
		const fnc = () => undefined;

		hook.addSubscriber(fnc);
		hook.removeSubscriber(fnc);

		expect(hook.hasSubscriber(fnc)).toBe(false);
	});

	it("launch subscriber", () => {
		let testlaunch = false;
		const fnc = () => {
			testlaunch = true;
		};

		hook.addSubscriber(fnc);
		hook.launchSubscriber();

		expect(testlaunch).toBe(true);
	});

	it("launch subscriber async", async() => {
		let testlaunch = false;
		const fnc = async() => {
			await new Promise((res) => {
				setTimeout(res);
			});
			testlaunch = true;
		};

		hook.addSubscriber(fnc);
		await hook.launchSubscriberAsync();

		expect(testlaunch).toBe(true);
	});

	it("launch subscriber return", () => {
		let testlaunch = false;
		const fnc1 = () => true;
		const fnc2 = () => {
			testlaunch = true;
		};
		hook.addSubscriber(fnc1);
		hook.addSubscriber(fnc2);
		hook.launchSubscriber();

		expect(testlaunch).toBe(false);
	});

	it("launch subscriber async return", async() => {
		let testlaunch = false;
		const fnc1 = () => true;
		const fnc2 = () => {
			testlaunch = true;
		};
		hook.addSubscriber(fnc1);
		hook.addSubscriber(fnc2);
		await hook.launchSubscriberAsync();

		expect(testlaunch).toBe(false);
	});

	it("copy hook", async() => {
		let testlaunch = false;
		const fnc1 = () => true;
		const fnc = () => {
			testlaunch = true;
		};

		const copyedHook = new Hook(0);
		copyedHook.addSubscriber(fnc);
		copyedHook.addSubscriber(fnc1);
		hook.addSubscriber(copyedHook);

		hook.launchSubscriber();

		expect(testlaunch).toBe(true);

		testlaunch = false;

		await hook.launchSubscriberAsync();

		expect(testlaunch).toBe(true);
	});

	it("copy hook and build", async() => {
		let testlaunch = false;
		const fnc = () => {
			testlaunch = true;
		};

		const copyedHook = new Hook(0);
		copyedHook.addSubscriber(fnc);
		hook.addSubscriber(copyedHook);

		const buidedHook = hook.build();
		await buidedHook();

		expect(testlaunch).toBe(true);
	});

	it("build hook", async() => {
		let testlaunch = false;
		const fnc = () => {
			testlaunch = true;
		};

		hook.addSubscriber(fnc);
		const buidedHook = hook.build();
		await buidedHook();

		expect(testlaunch).toBe(true);
	});

	it("build hook return", async() => {
		let testlaunch = false;
		const fnc1 = () => true;
		const fnc2 = () => {
			testlaunch = true;
		};

		hook.addSubscriber(fnc1);
		hook.addSubscriber(fnc2);
		const buidedHook = hook.build();
		await buidedHook();

		expect(testlaunch).toBe(false);
	});

	it("makeHooksRouteLifeCycle", () => {
		const hooks = makeHooksRouteLifeCycle();
		Object.values(hooks).forEach((hook) => {
			expect(hook).instanceOf(Hook);
		});
	});
});

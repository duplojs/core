import { InvalideDateInTemporaryDescriptionParamsError } from "@scripts/error/invalideDateInTemporaryDescriptionParamsError";
import { TemporaryDescription } from "./temporary";

describe("TemporaryDescription", () => {
	class SubTemporaryDescription extends TemporaryDescription {
	}

	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("always", () => {
		const subTemporaryDescription = new SubTemporaryDescription();

		expect(subTemporaryDescription.isExpire).toBe(false);
	});

	it("forceExpire", () => {
		const subTemporaryDescription = new SubTemporaryDescription({
			type: "always",
			forceExpire: true,
		});

		expect(subTemporaryDescription.isExpire).toBe(true);
	});

	it("disabled-between", () => {
		const subTemporaryDescription = new SubTemporaryDescription({
			type: "disabled-between",
			start: "2025-02-25",
			end: "2025-02-28",
		});

		vi.setSystemTime("2025-02-26");
		expect(subTemporaryDescription.isExpire).toBe(true);

		vi.setSystemTime("2025-02-29");
		expect(subTemporaryDescription.isExpire).toBe(false);

		vi.setSystemTime("2025-02-24");
		expect(subTemporaryDescription.isExpire).toBe(false);
	});

	it("enabled-between", () => {
		const subTemporaryDescription = new SubTemporaryDescription({
			type: "enabled-between",
			start: "2025-02-25",
			end: "2025-02-28",
		});

		vi.setSystemTime("2025-02-26");
		expect(subTemporaryDescription.isExpire).toBe(false);

		vi.setSystemTime("2025-02-29");
		expect(subTemporaryDescription.isExpire).toBe(true);

		vi.setSystemTime("2025-02-24");
		expect(subTemporaryDescription.isExpire).toBe(true);
	});

	it("last line coverage", () => {
		const subTemporaryDescription = new SubTemporaryDescription(
			{
				type: "wtf",
			} as never,
		);
		expect(subTemporaryDescription.isExpire).toBe(true);
	});

	it("bad date", () => {
		const subTemporaryDescription = new SubTemporaryDescription(
			{
				type: "enabled-between",
				start: "2025-02-25",
				end: "",
			},
		);
		expect(() => subTemporaryDescription.isExpire).toThrowError(InvalideDateInTemporaryDescriptionParamsError);
	});
});

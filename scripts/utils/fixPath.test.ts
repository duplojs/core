import { fixPath } from "./fixPath";

it("fixPath", () => {
	expect(fixPath("test")).toBe("/test");

	expect(fixPath("/test/")).toBe("/test");

	expect(fixPath("test/")).toBe("/test");
});

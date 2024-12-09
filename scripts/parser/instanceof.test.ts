import { ZodError } from "zod";
import { instanceOfType } from "./instanceof";
import { zod, ZodAccelerator, ZodAcceleratorError } from ".";

describe("instanceof", () => {
	it("parse good class", () => {
		class Test {}
		const test = new Test();

		const scehma = instanceOfType(Test);

		expect(scehma.parse(test)).toBe(test);
	});

	it("parse wrong class", () => {
		class Test {}
		class Test1 {}
		const test1 = new Test1();

		const scehma = instanceOfType(Test);

		expect(scehma.safeParse(test1)).toMatchObject({
			error: new ZodError([
				{
					code: "custom",
					params: {
						message: "Input not instance of Test.",
					},
					path: [],
					message: "Invalid input",
				},
			]),
			success: false,
		});
	});

	it("parse good object with class", () => {
		class Test {}
		const test = new Test();

		const scehma = zod.object({
			test: instanceOfType(Test),
		});

		expect(scehma.parse({ test })).toMatchObject({
			test: new Test(),
		});
	});

	it("parse wrong object with class", () => {
		class Test {}
		class Test1 {}
		const test1 = new Test1();

		const scehma = zod.object({
			test: instanceOfType(Test),
		});

		expect(scehma.safeParse({ test: test1 })).toMatchObject({
			error: new ZodError([
				{
					code: "custom",
					params: {
						message: "Input not instance of Test.",
					},
					path: ["test"],
					message: "Invalid input",
				},
			]),
			success: false,
		});
	});

	describe("accelerate", () => {
		it("parse good class", () => {
			class Test {}
			const test = new Test();

			const scehma = ZodAccelerator.build(instanceOfType(Test));

			expect(scehma.parse(test)).toBe(test);
		});

		it("parse wrong class", () => {
			class Test {}
			class Test1 {}
			const test1 = new Test1();

			const scehma = ZodAccelerator.build(instanceOfType(Test));

			expect(scehma.safeParse(test1)).toMatchObject({
				error: new ZodAcceleratorError(".", "Input is not instanceof Test."),
				success: false,
			});
		});

		it("parse good object with class", () => {
			class Test {}
			const test = new Test();

			const scehma = ZodAccelerator.build(
				zod.object({
					test: instanceOfType(Test),
				}),
			);

			expect(scehma.parse({ test })).toMatchObject({
				test: new Test(),
			});
		});

		it("parse wrong object with class", () => {
			class Test {}
			class Test1 {}
			const test1 = new Test1();

			const scehma = ZodAccelerator.build(
				zod.object({
					test: instanceOfType(Test),
				}),
			);

			expect(scehma.safeParse({ test: test1 })).toMatchObject({
				error: new ZodAcceleratorError(".test", "Input is not instanceof Test."),
				success: false,
			});
		});
	});
});

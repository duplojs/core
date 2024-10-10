import { NeedOverrideError } from "@scripts/error/needOverrideError";
import { File } from "./file";

describe("File", () => {
	it("getExtension", () => {
		expect(File.getExtension("")).toBe("");
		expect(File.getExtension("/tmp/test.png")).toBe(".png");
		expect(File.getExtension("/tmp/test.toto.png")).toBe(".png");
		expect(File.getExtension("/tmp/test")).toBe("");
	});

	it("getName", () => {
		expect(File.getName("")).toBe("");
		expect(File.getName("test.png")).toBe("test.png");
		expect(File.getName("/tmp/test.png")).toBe("test.png");
		expect(File.getName("/tmp/test.toto.png")).toBe("test.toto.png");
		expect(File.getName("/tmp/test")).toBe("test");
	});

	it("getPath", () => {
		expect(File.getPath("")).toBe("");
		expect(File.getPath("test.png")).toBe("");
		expect(File.getPath("/tmp/test.png")).toBe("/tmp");
		expect(File.getPath("/tmp/time/test.toto.png")).toBe("/tmp/time");
		expect(File.getPath("/tmp/test")).toBe("/tmp");
		expect(File.getPath("tmp/test/")).toBe("tmp/test");
	});

	it("overpassable methods", async() => {
		await expect(() => File.delete("")).rejects.toThrowError(NeedOverrideError);
		await expect(() => File.deplace("", "")).rejects.toThrowError(NeedOverrideError);
		await expect(() => File.exist("")).rejects.toThrowError(NeedOverrideError);
		await expect(() => File.move("", "")).rejects.toThrowError(NeedOverrideError);
		await expect(() => File.rename("", "")).rejects.toThrowError(NeedOverrideError);
	});

	it("delete", async() => {
		const spy = vi.spyOn(File, "delete").mockResolvedValue(undefined);

		const file = new File("/tmp/test");

		await file.delete();

		expect(spy).lastCalledWith("/tmp/test");
	});

	it("deplace", async() => {
		const spy = vi.spyOn(File, "deplace").mockResolvedValue(undefined);

		const file = new File("/tmp/test");

		await file.deplace("toto/");

		expect(spy).lastCalledWith("/tmp/test", "toto/");
	});

	it("rename", async() => {
		const spy = vi.spyOn(File, "rename").mockResolvedValue(undefined);

		const file = new File("/tmp/test");

		await file.rename("toto");

		expect(spy).lastCalledWith("/tmp/test", "/tmp/toto");
	});

	it("move", async() => {
		const spy = vi.spyOn(File, "move").mockResolvedValue(undefined);

		const file = new File("/tmp/test");

		await file.move("toto");

		expect(spy).lastCalledWith("/tmp/test", "toto/test");
	});

	it("exist", async() => {
		const spy = vi.spyOn(File, "exist").mockResolvedValue(true);

		const file = new File("/tmp/test");

		expect(await file.exist()).toBe(true);
		expect(spy).lastCalledWith("/tmp/test");
	});

	it("construct without information", () => {
		const file = new File("/tmp/test.png");

		expect(file.informations.extension).toBe(".png");
		expect(file.informations.mimeType).toBe("image/png");
		expect(file.informations.name).toBe("test.png");
	});

	it("construct with name", () => {
		const file = new File("/tmp/test", { name: "test.jpg" });

		expect(file.informations.extension).toBe(".jpg");
		expect(file.informations.mimeType).toBe("image/jpeg");
		expect(file.informations.name).toBe("test.jpg");
	});
});

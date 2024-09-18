import { File } from "./file";

describe("File", () => {
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

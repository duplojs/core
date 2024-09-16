import ZodAccelerator from "@duplojs/zod-accelerator";
import { z as zod } from "zod";
export * from "./presetCheck";

ZodAccelerator.injectZod(zod);

export {
	zod,
};

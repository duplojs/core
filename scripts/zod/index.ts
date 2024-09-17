import ZodAccelerator from "@duplojs/zod-accelerator";
import { z } from "zod";
import { multipartFormData } from "./multipartFormData";
export * from "./presetCheck";
export * from "./multipartFormData";
import "./toArray";

const zod = {
	...z,
	multipartFormData,
};

ZodAccelerator.injectZod(zod);

export {
	zod,
	type z as zodSpace,
};

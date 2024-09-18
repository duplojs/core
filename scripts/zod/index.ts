import ZodAccelerator from "@duplojs/zod-accelerator";
import { z } from "zod";
import { receiveFormData } from "./receiveFormData";
export * from "./presetCheck";
export * from "./receiveFormData";
import "./toArray";

const zod = {
	...z,
	receiveFormData,
};

ZodAccelerator.injectZod(zod);

export {
	zod,
	type z as zodSpace,
};

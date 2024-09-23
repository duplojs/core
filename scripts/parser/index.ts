import ZodAccelerator from "@duplojs/zod-accelerator";
import { z } from "zod";
import { receiveFormData } from "./receiveFormData";
import { ZodPresetChecker } from "./presetCheck";
export * from "./presetCheck";
export * from "./receiveFormData";
import "./toArray";

const zod = {
	...z,
	receiveFormData,
	ZodPresetChecker,
};

ZodAccelerator.injectZod(zod);

const zoderce = zod.coerce;

export {
	zod,
	zoderce,
	type z as ZodSpace,
};

import ZodAccelerator from "@duplojs/zod-accelerator";
import { z } from "zod";
import { receiveFormData } from "./receiveFormData";
import { ZodPresetChecker } from "./presetCheck";
import { booleanInString } from "./booleanInString";
export * from "./presetCheck";
export * from "./receiveFormData";
export { ZodAccelerator, zodSchemaIsAsync, ZodAcceleratorParser, ZodAcceleratorError } from "@duplojs/zod-accelerator";
import "./toArray";

const zod = {
	...z,
	receiveFormData,
	ZodPresetChecker,
	booleanInString,
};

const zoderce = zod.coerce;

ZodAccelerator.injectZod(zod);

export {
	zod,
	zoderce,
	type z as ZodSpace,
};

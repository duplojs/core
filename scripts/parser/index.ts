import ZodAccelerator from "@duplojs/zod-accelerator";
import { z as ZodSpace } from "zod";
import { receiveFormData, ZodReceiveFormData } from "./receiveFormData";
import { instanceOfType, ZodInstanceof } from "./instanceof";
import { ZodPresetChecker } from "./presetCheck";
import { booleanInString } from "./booleanInString";
export * from "./presetCheck";
export * from "./receiveFormData";
export * from "./instanceof";
export { ZodAccelerator, zodSchemaIsAsync, ZodAcceleratorParser, ZodAcceleratorError } from "@duplojs/zod-accelerator";
import "./toArray";

const zod = {
	...ZodSpace,
	receiveFormData,
	ZodPresetChecker,
	ZodReceiveFormData,
	booleanInString,
	ZodInstanceof,
	instanceof: instanceOfType,
};

const zoderce = zod.coerce;

ZodAccelerator.injectZod(ZodSpace);

export {
	zod,
	zoderce,
	ZodSpace,
};

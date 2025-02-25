import ZodAccelerator from "@duplojs/zod-accelerator";
import { z as ZodSpace } from "zod";
import { receiveFormData, ZodReceiveFormData } from "./receiveFormData";
import { instanceOfType, ZodInstanceof } from "./instanceof";
import { booleanInString } from "./booleanInString";
export * from "./receiveFormData";
export * from "./instanceof";
export { ZodAccelerator, zodSchemaIsAsync, ZodAcceleratorParser, ZodAcceleratorError } from "@duplojs/zod-accelerator";
import "./toArray";

const zod = {
	...ZodSpace,
	receiveFormData,
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

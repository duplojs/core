import { makeResponseContract, Response } from "@scripts/response/index";
import * as advancedPresetResponse from "@scripts/response/advancedPreset";
import * as simplePresetResponse from "@scripts/response/simplePreset";
import { zod, zoderce } from "@scripts/parser/index";
import { useBuilder } from "@scripts/builder";
import { createChecker, createPresetChecker } from "@scripts/builder/checker";
import { createTypeInput } from "@utils/typeInput";
import { LocalPrefixDescription } from "./description/prefix/local";
import { ContextPrefixDescription } from "./description/prefix/context";
import { GlobalPrefixDescription } from "./description/prefix/global";
import { ForceDisabledRuntimeEndPointCheck } from "./description/runtimeEndPointCheck/forceDisabled";
import { ForceEnabledRuntimeEndPointCheck } from "./description/runtimeEndPointCheck/forceEnabled";
import { ForceDisabledZodAccelerator } from "./description/zodAccelerator/forceDisabled";
import { ForceEnabledZodAccelerator } from "./description/zodAccelerator/forceEnabled";
import { createProcess } from "./builder/process";

export const globalValues = {
	Response,
	...advancedPresetResponse,
	...simplePresetResponse,
	zod,
	zoderce,
	useBuilder,
	createProcess,
	createChecker,
	createPresetChecker,
	createTypeInput,
	makeResponseContract,
	LocalPrefixDescription,
	ContextPrefixDescription,
	GlobalPrefixDescription,
	ForceDisabledRuntimeEndPointCheck,
	ForceEnabledRuntimeEndPointCheck,
	ForceDisabledZodAccelerator,
	ForceEnabledZodAccelerator,
};

import { makeResponseContract, Response } from "@scripts/response/index";
import * as advancedPresetResponse from "@scripts/response/advancedPreset";
import * as simplePresetResponse from "@scripts/response/simplePreset";
import { zod, zoderce } from "@scripts/parser/index";
import { useBuilder } from "@scripts/builder/duplose";
import { createChecker, createPresetChecker } from "@scripts/builder/checker";
import { createTypeInput } from "@utils/typeInput";

export const globalValues = {
	Response,
	...advancedPresetResponse,
	...simplePresetResponse,
	zod,
	zoderce,
	useBuilder,
	createChecker,
	createPresetChecker,
	createTypeInput,
	makeResponseContract,
};

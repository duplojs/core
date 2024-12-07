import { instanceofDuplose } from "./instanceDuplose";
import { manualProcess } from "@test/utils/manualDuplose";
import { type Duplose } from "@scripts/duplose";
import { type ExpectType } from "@test/utils/expectType";
import { type CurrentRequestObject } from "@scripts/request";
import { Process, type ProcessDefinition } from "@scripts/duplose/process";

it("instanceofDuplose", () => {
	const testProcess: Duplose<any, any, any> = manualProcess;

	if (!instanceofDuplose(Process, testProcess)) {
		throw new Error("instance error");
	}

	type check = ExpectType<
		typeof testProcess,
		Process<ProcessDefinition, CurrentRequestObject, object>,
		"strict"
	>;
});

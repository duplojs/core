import { instanceofDuplose } from "./instanceofDuplose";
import { manualProcess } from "@test/utils/manualDuplose";
import { type Duplose } from "@scripts/duplose";
import { type CurrentRequestObject } from "@scripts/request";
import { Process, type ProcessDefinition } from "@scripts/duplose/process";
import { type ExpectType } from "@duplojs/utils";

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

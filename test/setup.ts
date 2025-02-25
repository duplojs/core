/* eslint-disable @typescript-eslint/no-invalid-this */
import { clone } from "@duplojs/utils";
import { ZodError } from "zod";

expect.addEqualityTesters([
	function(expectValue, wantedValue) {
		if (expectValue instanceof ZodError && wantedValue instanceof ZodError) {
			const { addIssue: _addIssue1, addIssues: _addIssues1, ...expectValueWhoCanCompare } = clone(expectValue);
			const { addIssue: _addIssue2, addIssues: _addIssues2, ...wantedValueWhoCanCompare } = clone(wantedValue);

			return this.equals(expectValueWhoCanCompare, wantedValueWhoCanCompare);
		} else {
			return undefined;
		}
	},
]);

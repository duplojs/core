import { type ZodArray, ZodType, type ZodUnion } from "zod";
import { zod } from ".";

declare module "zod" {
	interface ZodType {
		toArray(): ZodUnion<[
			ZodEffects<
				this,
				this["_output"][],
				this["_input"]
			>,
			ZodArray<this>,
		]>;
	}
}

ZodType.prototype.toArray = function() {
	return zod.union([
		this.transform((value) => [value]),
		this.array(),
	]);
};

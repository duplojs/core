import { type ZodArray, type ZodEffects, ZodType, type ZodUnion } from "zod";
import { zod } from ".";

declare module "zod" {
	interface ZodType {
		toArray(): ZodUnion<[
			ZodArray<this>,
			ZodEffects<
				this,
				this["_output"][],
				this["_input"]
			>,
		]>;
	}
}

ZodType.prototype.toArray = function() {
	return zod.union([
		this.array(),
		this.transform((value) => [value]),
	]);
};

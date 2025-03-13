import { createProcess, zod } from "@scripts/index";
import { processWith13Steps } from "./with13Steps";

export const processWith12Steps = createProcess("")
	.execute(processWith13Steps)
	.extract({
		params: {
			c0: zod.string(),
		},
	})
	.extract({
		params: {
			c1: zod.string(),
		},
	})
	.extract({
		params: {
			c2: zod.string(),
		},
	})
	.extract({
		params: {
			c3: zod.string(),
		},
	})
	.extract({
		params: {
			c4: zod.string(),
		},
	})
	.extract({
		params: {
			c5: zod.string(),
		},
	})
	.extract({
		params: {
			c6: zod.string(),
		},
	})
	.extract({
		params: {
			c7: zod.string(),
		},
	})
	.extract({
		params: {
			c8: zod.string(),
		},
	})
	.extract({
		params: {
			c9: zod.string(),
		},
	})
	.extract({
		params: {
			c10: zod.string(),
		},
	})
	.extract({
		params: {
			c11: zod.string(),
		},
	})
	.cut(
		({ dropper }) => dropper({
			test12: "toto",
		}),
		["test12"],
	)
	.exportation(["test12"]);

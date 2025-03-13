import { createProcess, zod } from "@scripts/index";

export const processWith13Steps = createProcess("")
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
	.extract({
		params: {
			c12: zod.string(),
		},
	})
	.cut(
		({ dropper }) => dropper({
			test13: "toto",
		}),
		["test13"],
	)
	.exportation(["test13"]);

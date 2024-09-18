import { advancedEval } from "@utils/advancedEval";
import type { Mock } from "vitest";

vi.mock("@utils/advancedEval", async(original) => ({
	advancedEval: vi.fn(() => (() => ({}))),
	advancedEvalOriginal: (await original<{ advancedEval: unknown }>()).advancedEval,
}));

export async function mokeAdvancedEval() {
	const {
		advancedEvalOriginal,
	} = await import("@utils/advancedEval") as any as {
		advancedEvalOriginal: typeof advancedEval;
	};

	return {
		advancedEval: advancedEval as Mock,
		advancedEvalOriginal,
	};
}

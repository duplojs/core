import type { ZodSpace } from "@scripts/parser";
import type { ObjectKey } from "./types";

export type Brand<T extends ObjectKey> = ZodSpace.BRAND<T>;

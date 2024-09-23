import { zod, type ZodSpace } from "@scripts/parser";

export function findZodTypeInZodSchema<
	T extends new(...args: any[]) => ZodSpace.ZodType,
>(
	zodType: T[],
	zodSchema: unknown,
	findedZodSchema: InstanceType<T>[] = [],
	lazyMap = new Set(),
): InstanceType<T>[] {
	if (lazyMap.has(zodSchema)) {
		return [];
	}

	lazyMap.add(zodSchema);

	if (zodType.find((value) => zodSchema instanceof value)) {
		findedZodSchema.push(zodSchema as InstanceType<T>);
	}

	if (zodSchema instanceof zod.ZodArray) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.type,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodCatch) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.innerType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodDefault) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.innerType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodEffects) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.schema,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodIntersection) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.left,
			findedZodSchema,
			lazyMap,
		);

		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.right,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodLazy) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.getter(),
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodMap) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.keyType,
			findedZodSchema,
			lazyMap,
		);

		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.valueType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodNullable) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.innerType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodObject) {
		Object.values(zodSchema._def.shape() as ZodSpace.ZodType)
			.forEach(
				(value) => void findZodTypeInZodSchema(
					zodType,
					value,
					findedZodSchema,
					lazyMap,
				),
			);
	} else if (zodSchema instanceof zod.ZodOptional) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.innerType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodPipeline) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.in,
			findedZodSchema,
			lazyMap,
		);

		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.out,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodPromise) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.type,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodReadonly) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.innerType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodRecord) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.keyType,
			findedZodSchema,
			lazyMap,
		);

		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.valueType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodSet) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.valueType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodTuple) {
		(zodSchema._def.items as ZodSpace.ZodType[])
			.forEach(
				(value) => void findZodTypeInZodSchema(
					zodType,
					value,
					findedZodSchema,
					lazyMap,
				),
			);

		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.rest,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof zod.ZodUnion) {
		(zodSchema._def.options as ZodSpace.ZodType[])
			.forEach(
				(value) => void findZodTypeInZodSchema(
					zodType,
					value,
					findedZodSchema,
					lazyMap,
				),
			);
	}

	return findedZodSchema;
}

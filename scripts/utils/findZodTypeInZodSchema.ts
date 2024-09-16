import {
	ZodEffects,
	ZodObject,
	type ZodType,
	ZodArray,
	ZodCatch,
	ZodDefault,
	ZodIntersection,
	ZodLazy,
	ZodOptional,
	ZodReadonly,
	ZodRecord,
	ZodTuple,
	ZodUnion,
	ZodPipeline,
	ZodNullable,
	ZodPromise,
	ZodSet,
	ZodMap,
} from "zod";

export function findZodTypeInZodSchema<
	T extends new(...args: any[]) => ZodType,
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

	if (zodSchema instanceof ZodArray) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.type,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof ZodCatch) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.innerType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof ZodDefault) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.innerType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof ZodEffects) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.schema,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof ZodIntersection) {
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
	} else if (zodSchema instanceof ZodLazy) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.getter(),
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof ZodMap) {
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
	} else if (zodSchema instanceof ZodNullable) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.innerType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof ZodObject) {
		Object.values(zodSchema._def.shape() as ZodType)
			.forEach(
				(value) => void findZodTypeInZodSchema(
					zodType,
					value,
					findedZodSchema,
					lazyMap,
				),
			);
	} else if (zodSchema instanceof ZodOptional) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.innerType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof ZodPipeline) {
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
	} else if (zodSchema instanceof ZodPromise) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.type,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof ZodReadonly) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.innerType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof ZodRecord) {
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
	} else if (zodSchema instanceof ZodSet) {
		findZodTypeInZodSchema(
			zodType,
			zodSchema._def.valueType,
			findedZodSchema,
			lazyMap,
		);
	} else if (zodSchema instanceof ZodTuple) {
		(zodSchema._def.items as ZodType[])
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
	} else if (zodSchema instanceof ZodUnion) {
		(zodSchema._def.options as ZodType[])
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

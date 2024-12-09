import ZodAccelerator from "@duplojs/zod-accelerator";
import { type ZodAcceleratorContent } from "node_modules/@duplojs/zod-accelerator/types/content";
import { addIssueToContext, INVALID, type ParseInput, type ParseReturnType, ParseStatus, ZodIssueCode, ZodType, type ZodTypeDef } from "zod";

export interface ZodInstanceofDef<
	GenericConstructor extends new(...args: any[]) => any = any,
> extends ZodTypeDef {
	constructor: GenericConstructor;
}

export class ZodInstanceof<
	GenericConstructor extends new(...args: any[]) => any,
> extends ZodType<
		InstanceType<GenericConstructor>,
		ZodInstanceofDef<GenericConstructor>
	> {
	public _parse(input: ParseInput): ParseReturnType<this["_output"]> {
		const { constructor } = this._def;
		const { data } = input;
		const status = new ParseStatus();

		if (data instanceof constructor) {
			return {
				status: status.value,
				value: data,
			};
		} else {
			const ctx = this._getOrReturnCtx(input);
			addIssueToContext(ctx, {
				code: ZodIssueCode.custom,
				params: {
					message: `Input not instance of ${constructor.name}`,
				},
			});
			return INVALID;
		}
	}

	public static create<
		GenericConstructor extends new(...args: any[]) => any = any,
	>(
		constructor: GenericConstructor,
	): ZodInstanceof<GenericConstructor> {
		return new ZodInstanceof({
			constructor,
		});
	}
}

export function instanceOfType<
	GenericConstructor extends new(...args: any[]) => any,
>(constructor: GenericConstructor) {
	return ZodInstanceof.create<GenericConstructor>(constructor);
}

ZodAccelerator.accelerators.unshift(
	{
		get support() {
			return ZodInstanceof;
		},

		makeAcceleratorContent(
			zodSchema: ZodInstanceof<new() => any>,
			zac: ZodAcceleratorContent,
		): ZodAcceleratorContent {
			const def = zodSchema._def;

			zac.addContent(
				{
					if: "!($input instanceof $this.constructor)",
					message: `Input is not instanceof ${def.constructor.name}.`,
					ctx: {
						constructor: def.constructor,
					},
				},
			);

			return zac;
		},
	},
);

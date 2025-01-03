import { type RouteBuilder } from "@scripts/builder/route";
import { type AnyFunction } from "./types";
import { simpleClone } from "./simpleClone";
import { Route } from "@scripts/duplose/route";

export type BuilderDefinitionInitializer = (...args: any[]) => object;

export interface BuilderMethodParameters<
	GenericCurrentMethod extends AnyFunction,
	GenericDefinition extends object,
	GenericComplexObject extends object,
> {
	args: Parameters<GenericCurrentMethod>;
	definition: GenericDefinition;
	nextBuilder(definition: GenericDefinition): never;
	stopBuilder(complexObject: GenericComplexObject): GenericComplexObject;
}

export type CallbackMethodBuilder<
	GenericCurrentMethod extends AnyFunction = AnyFunction,
	GenericDefinition extends object = object,
	GenericComplexObject extends object = object,
> = (
	params: BuilderMethodParameters<
		GenericCurrentMethod,
		GenericDefinition,
		GenericComplexObject
	>
) => never;

export function createBuilder<
	GenericBuilder extends object,
	GenericComplexObject extends object
>() {
	return <
		GenericArgumentsInitializer extends [...any],
		GenericDefinition extends object,
	>(initializer: (...args: GenericArgumentsInitializer) => GenericDefinition) => {
		const entries = Symbol("builderEntries");

		function builder(...args: GenericArgumentsInitializer): GenericBuilder {
			const definition = initializer(...args);

			function stopBuilder(complexObject: GenericComplexObject) {
				return complexObject
			}

			function nextBuilder(definition: GenericDefinition): never {
				return <never>builder[entries].reduce<
					Record<string, AnyFunction>
				>(
					(pv, [key, method]) => ({
						...pv,
						[key]: (...args) => method({
							args,
							definition: simpleClone(definition),
							nextBuilder,
							stopBuilder,
						}),
					}),
					{},
				);
			}

			return nextBuilder(definition);
		}

		builder.addMethod = function<
			GenericKeyMethod extends Extract<keyof GenericBuilder, string>,
		>(
			key: GenericKeyMethod,
			callback: CallbackMethodBuilder<
				GenericBuilder[GenericKeyMethod] extends AnyFunction ? GenericBuilder[GenericKeyMethod] : never,
				GenericDefinition
			>,
		) {
			builder[entries].push([key, <never>callback])

			return builder;
		};

		builder[entries] = <[string, CallbackMethodBuilder][]>[];

		builder.createdObjects = new Set<GenericComplexObject>();

		return builder;
	};
}

const builder = createBuilder<RouteBuilder, Route>()((lolo: string) => ({ lolo }))
	.setMethod("check", ({args}) => (1));

builder()
	.;

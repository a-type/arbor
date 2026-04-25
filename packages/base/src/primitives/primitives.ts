import { createProp, PropertyDefinition } from '../core/properties';
import {
	createColorDarkModeRange,
	createColorLightModeRange,
} from '../core/ranges';
import { SchemeDefinition } from '../schemes/schemes';
import { createGlobalProps } from './globalsConfig';
import { $labelProps } from './labelProps';

export const defaultRangeSteps = [
	'ink',
	'heavier',
	'heavy',
	'mid',
	'light',
	'lighter',
	'wash',
	'paper',
] as const;
type DefaultRangeStep = (typeof defaultRangeSteps)[number];

export const defaultSchemes = {
	light: {
		getColorRange: createColorLightModeRange,
		tag: '☀️',
	},
	dark: {
		getColorRange: createColorDarkModeRange,
		tag: '🌑',
	},
} satisfies Record<string, SchemeDefinition>;

export interface PrimitiveGlobals {
	saturation: number;
}

export const defaultGlobals: PrimitiveGlobals = {
	saturation: 0.5,
};

export const defaultDefaultScheme = 'light';

export interface PrimitivesConfig<
	THueNames extends string = string,
	TRangeSteps extends string = string,
> {
	namedHues: Record<THueNames, number>;
	rangeSteps: readonly TRangeSteps[];
	schemes: Record<string, SchemeDefinition>;
	defaultScheme: 'light' | 'dark' | (string & {});
	globals: PrimitiveGlobals;
}

export type Primitives<
	THueNames extends string = string,
	TRangeSteps extends string = string,
> = {
	namedHues: Record<THueNames, number>;
	rangeSteps: readonly TRangeSteps[];
	schemes: { light: SchemeDefinition; dark: SchemeDefinition } & Record<
		string,
		SchemeDefinition
	>;
	defaultScheme: 'light' | 'dark' | (string & {});
	globals: PrimitiveGlobals;
	$props: {
		labels: typeof $labelProps;
		colors: Record<THueNames, Record<TRangeSteps, PropertyDefinition>>;
		user: {
			saturation: PropertyDefinition;
		};
	};
};

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function createPrimitives<
	THueNames extends string = string,
	TRangeSteps extends string = DefaultRangeStep,
>(
	config: MakeOptional<
		PrimitivesConfig<THueNames, TRangeSteps>,
		'rangeSteps' | 'schemes' | 'defaultScheme' | 'globals'
	>,
): Primitives<THueNames, TRangeSteps> {
	const { namedHues, rangeSteps = defaultRangeSteps } = config;
	const schemes = {
		...defaultSchemes,
		...config.schemes,
	};
	const colorProps = Object.fromEntries(
		Object.entries(config.namedHues).map(([name, hue]) => {
			return [
				name,
				Object.fromEntries(
					rangeSteps.map((step) => {
						const propName = `${name}-${step}`;
						return [step, createProp(propName, { type: 'color' })];
					}),
				),
			];
		}),
	);

	const globals: PrimitiveGlobals = {
		...defaultGlobals,
		...config.globals,
	};

	const userProps = createGlobalProps(globals);

	return {
		namedHues,
		rangeSteps: rangeSteps as readonly TRangeSteps[],
		schemes,
		defaultScheme: config.defaultScheme ?? defaultDefaultScheme,
		globals,
		$props: {
			labels: $labelProps,
			colors: colorProps as any,
			user: userProps,
		},
	};
}

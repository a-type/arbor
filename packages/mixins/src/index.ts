import {
	$,
	CalcInterpolation,
	CalcOperations,
	css,
	Css,
	type Equation,
	isCalcEquation,
	printEquation,
} from '@arbor-css/calc';
import { DEFAULT_TOKEN_PREFIX } from '@arbor-css/tokens';

export const MIXIN_PREFIX = `${DEFAULT_TOKEN_PREFIX}mixin-`;

const MIXIN_BRAND = '@@MIXIN@@';

export type ArborMixinDeclaration = {
	prop: string;
	value: Equation;
};

type MixinValue = CalcInterpolation | Equation;
type MixinBodyObject = Record<string, MixinValue>;
type MixinBodyList = readonly {
	prop: string;
	value: MixinValue;
}[];

function toEquation(value: MixinValue): Equation {
	if (isCalcEquation(value)) {
		return value;
	}

	return css`
		${value}
	`;
}

function normalizeDeclarations(
	body: MixinBodyObject | MixinBodyList,
): ArborMixinDeclaration[] {
	if (Array.isArray(body)) {
		return body.map((decl) => ({
			prop: decl.prop,
			value: toEquation(decl.value),
		}));
	}

	return Object.entries(body).map(([prop, value]) => ({
		prop,
		value: toEquation(value),
	}));
}

export function createMixinFactory({
	tokenPrefix = DEFAULT_TOKEN_PREFIX,
}: {
	tokenPrefix?: string;
} = {}) {
	const mixinPrefix = `${tokenPrefix}mixin-`;

	return function createMixin(
		name: string,
		{
			description,
			definition,
		}: {
			description?: string;
			definition: (
				css: Css & CalcOperations,
			) => MixinBodyObject | MixinBodyList;
		},
	): ArborMixin {
		const cssName = `${mixinPrefix}${name}`;
		const definitionTools = Object.assign(css, $) as Css & CalcOperations;
		const declarations = normalizeDeclarations(definition(definitionTools));
		const body = declarations
			.map((decl) => `${decl.prop}: ${printEquation(decl.value)};`)
			.join(' ');

		return {
			[MIXIN_BRAND]: true as const,
			name: cssName,
			description,
			declarations,
			definition: `@mixin ${cssName} { ${body} }`,
			inline: () =>
				declarations.map((decl) => ({
					prop: decl.prop,
					value: decl.value,
				})),
		};
	};
}

/**
 * Creates a CSS mixin that can be applied via the `@apply` at-rule in CSS,
 * with support for dynamic values via CSS custom properties.
 * The mixin's definition is provided as a function that receives CSS
 * and calculation utilities, allowing for complex logic and computations
 * in the mixin body.
 */
export type CreateMixin = ReturnType<typeof createMixinFactory>;

export type ArborMixin = {
	[MIXIN_BRAND]: true;
	name: string;
	description?: string;
	declarations: ArborMixinDeclaration[];
	definition: string;
	inline: () => ArborMixinDeclaration[];
};

export type PresetMixins = Record<string, ArborMixin>;

export function isMixin(value: unknown): value is ArborMixin {
	return typeof value === 'object' && value !== null && MIXIN_BRAND in value;
}

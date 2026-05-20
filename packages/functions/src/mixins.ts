import {
	CalcInterpolation,
	css,
	Css,
	type Equation,
	isCalcEquation,
	printEquation,
} from '@arbor-css/calc';
import { DEFAULT_TOKEN_PREFIX } from '@arbor-css/tokens';
import {
	FunctionParams,
	paramsAsInterpolations,
	ParamsAsInterpolations,
	paramsAsString,
} from './common.js';

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

export interface CreateMixinParameters<TParams extends FunctionParams> {
	description?: string;
	parameters?: TParams;
	definition: (
		css: Css,
		...params: ParamsAsInterpolations<TParams>
	) => MixinBodyObject | MixinBodyList;
}

/**
 * Creates a CSS mixin that can be applied via the `@apply` at-rule in CSS,
 * with support for dynamic values via CSS custom properties.
 * The mixin's definition is provided as a function that receives CSS
 * and calculation utilities, allowing for complex logic and computations
 * in the mixin body.
 *
 * @example
 * const shadowMixin = createMixin('shadow', {
 *   description: 'Applies a shadow with configurable color and size',
 *   parameters: [
 *     '--default-ring-color',
 *   ],
 *   definition: (css, defaultRingColor) => ({
 *     '--shadow': css`0 0 0 0 transparent`,
 *     '--ring': css`0 0 0 0 var(${defaultRingColor}, transparent)`,
 *     'box-shadow': css`var(--ring), var(--shadow)`,
 *  }),
 */
export type CreateMixin = <TParams extends FunctionParams>(
	name: string,
	parameters: CreateMixinParameters<TParams>,
) => ArborMixin;

export function createMixinFactory({
	tokenPrefix = DEFAULT_TOKEN_PREFIX,
}: {
	tokenPrefix?: string;
} = {}) {
	const mixinPrefix = `${tokenPrefix}mixin-`;

	return function createMixin<TParams extends FunctionParams>(
		name: string,
		{
			description,
			definition,
			parameters = [] as unknown as TParams,
		}: CreateMixinParameters<TParams>,
	): ArborMixin {
		const cssName = `${mixinPrefix}${name}`;
		const declarations = normalizeDeclarations(
			definition(css, ...paramsAsInterpolations(parameters)),
		);
		const body = declarations
			.map((decl) => `${decl.prop}: ${printEquation(decl.value)};`)
			.join(' ');

		return {
			[MIXIN_BRAND]: true as const,
			name: cssName,
			description,
			declarations,
			definition: `@mixin ${cssName}${paramsAsString(parameters)} { ${body} }`,
			inline: () =>
				declarations.map((decl) => ({
					prop: decl.prop,
					value: decl.value,
				})),
			parameters,
		};
	} satisfies CreateMixin;
}

export type ArborMixin = {
	[MIXIN_BRAND]: true;
	name: string;
	description?: string;
	declarations: ArborMixinDeclaration[];
	definition: string;
	inline: () => ArborMixinDeclaration[];
	parameters: FunctionParams;
};

export type PresetMixins = Record<string, ArborMixin>;

export function isMixin(value: unknown): value is ArborMixin {
	return typeof value === 'object' && value !== null && MIXIN_BRAND in value;
}

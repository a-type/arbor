import {
	CalcInterpolation,
	css,
	Css,
	type Equation,
	isCalcEquation,
	printEquation,
} from '@arbor-css/calc';
import {
	convertSimpleTokenSchema,
	CreateToken,
	SimpleTokensAsTokenDefinitions,
	SimpleTokenSchema,
	TokenSchema,
} from '@arbor-css/tokens';
import {
	FunctionParams,
	paramsAsInterpolations,
	ParamsAsInterpolations,
	paramsAsString,
} from './common.js';

export const DEFAULT_MIXIN_NAME_PREFIX = '--mx-';

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

export interface CreateMixinParameters<
	TParams extends FunctionParams,
	TTokens extends SimpleTokenSchema = SimpleTokenSchema,
> {
	description?: string;
	parameters?: TParams;
	definition: (
		css: Css,
		inputs: {
			parameters: ParamsAsInterpolations<TParams>;
			tokens: SimpleTokensAsTokenDefinitions<TTokens>;
		},
	) => MixinBodyObject | MixinBodyList;
	contributeTokens?: TTokens;
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
export type CreateMixin = <
	TParams extends FunctionParams,
	TTokens extends SimpleTokenSchema,
>(
	name: string,
	parameters: CreateMixinParameters<TParams, TTokens>,
) => ArborMixin<TParams, SimpleTokensAsTokenDefinitions<TTokens>>;

export function createMixinFactory({
	namePrefix = DEFAULT_MIXIN_NAME_PREFIX,
	createToken,
}: {
	namePrefix?: string;
	createToken: CreateToken;
}) {
	const mixinPrefix = namePrefix;

	return function createMixin<
		TParams extends FunctionParams,
		TTokens extends SimpleTokenSchema,
	>(
		name: string,
		{
			description,
			definition,
			parameters = [] as unknown as TParams,
			contributeTokens: contributeTokensInput = {} as unknown as TTokens,
		}: CreateMixinParameters<TParams, TTokens>,
	): ArborMixin<TParams, SimpleTokensAsTokenDefinitions<TTokens>> {
		const cssName = `${mixinPrefix}${name}`;
		const contributeTokens = convertSimpleTokenSchema(
			contributeTokensInput,
			name,
			createToken,
		);
		const declarations = normalizeDeclarations(
			definition(css, {
				parameters: paramsAsInterpolations(parameters),
				tokens: contributeTokens,
			}),
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
			contributeTokens,
		};
	};
}

export type ArborMixin<
	TParams extends FunctionParams = FunctionParams,
	TTokens extends TokenSchema = TokenSchema,
> = {
	[MIXIN_BRAND]: true;
	name: string;
	description?: string;
	declarations: ArborMixinDeclaration[];
	definition: string;
	inline: () => ArborMixinDeclaration[];
	parameters: TParams;
	contributeTokens: TTokens;
};

export type PresetMixins = Record<string, ArborMixin>;

export function isMixin(value: unknown): value is ArborMixin {
	return typeof value === 'object' && value !== null && MIXIN_BRAND in value;
}

export type MixinTokens<TMixins extends PresetMixins> = {
	[K in keyof TMixins]: TMixins[K] extends ArborMixin<any, infer TTokens> ?
		TTokens
	:	never;
};

export function extractMixinTokens<TMixins extends PresetMixins>(
	mixins: TMixins,
): MixinTokens<TMixins> {
	const tokens = {} as MixinTokens<TMixins>;

	for (const key in mixins) {
		const mixin = mixins[key];
		if (isMixin(mixin)) {
			tokens[key] = mixin.contributeTokens as any;
		}
	}

	return tokens;
}

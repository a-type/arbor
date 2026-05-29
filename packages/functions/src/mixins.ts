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
	isToken,
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

export type ArborMixinScope = {
	scope: string;
	children: ArborMixinBody;
};

export type ArborMixinBodyEntry = ArborMixinDeclaration | ArborMixinScope;
export type ArborMixinBody = ArborMixinBodyEntry[];

type MixinValue = CalcInterpolation | Equation;
type MixinScopedBodyObject = Record<string, MixinValue>;
type MixinBodyObject = Record<
	string,
	MixinValue | MixinScopedBodyObject | MixinBodyList
>;
type MixinBodyListItem =
	| {
			prop: string;
			value: MixinValue;
	  }
	| {
			scope: string;
			children: MixinBodyObject | MixinBodyList;
	  };
type MixinBodyList = readonly MixinBodyListItem[];

function toEquation(value: MixinValue): Equation {
	if (isCalcEquation(value)) {
		return value;
	}

	return css`
		${value}
	`;
}

function normalizeBody(body: MixinBodyObject | MixinBodyList): ArborMixinBody {
	if (Array.isArray(body)) {
		return body.map((item) => {
			if ('scope' in item) {
				return {
					scope: item.scope,
					children: normalizeBody(item.children),
				};
			}

			return {
				prop: item.prop,
				value: toEquation(item.value),
			};
		});
	}

	return Object.entries(body).map(([propOrScope, value]) => {
		if (
			typeof value === 'object' &&
			value !== null &&
			!isCalcEquation(value) &&
			!isToken(value)
		) {
			return {
				scope: propOrScope,
				children: normalizeBody(value as MixinBodyObject | MixinBodyList),
			};
		}

		return {
			prop: propOrScope,
			value: toEquation(value as MixinValue),
		};
	});
}

function collectDeclarations(body: ArborMixinBody): ArborMixinDeclaration[] {
	const declarations: ArborMixinDeclaration[] = [];

	for (const entry of body) {
		if ('prop' in entry) {
			declarations.push(entry);
			continue;
		}

		declarations.push(...collectDeclarations(entry.children));
	}

	return declarations;
}

function printBody(body: ArborMixinBody): string {
	return body
		.map((entry) => {
			if ('prop' in entry) {
				return `${entry.prop}: ${printEquation(entry.value)};`;
			}

			return `${entry.scope} { ${printBody(entry.children)} }`;
		})
		.join(' ');
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
			{
				contributedBy: cssName,
			},
		);
		const body = normalizeBody(
			definition(css, {
				parameters: paramsAsInterpolations(parameters),
				tokens: contributeTokens,
			}),
		);
		const declarations = collectDeclarations(body);
		const cssBody = printBody(body);

		return {
			[MIXIN_BRAND]: true as const,
			name: cssName,
			description,
			body,
			declarations,
			definition: `@mixin ${cssName}${paramsAsString(parameters)} { ${cssBody} }`,
			inline: () =>
				declarations.map((decl) => ({
					prop: decl.prop,
					value: decl.value,
				})),
			inlineBody: () =>
				body.map((entry) =>
					'prop' in entry ?
						{
							prop: entry.prop,
							value: entry.value,
						}
					:	{
							scope: entry.scope,
							children: entry.children,
						},
				),
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
	body: ArborMixinBody;
	declarations: ArborMixinDeclaration[];
	definition: string;
	inline: () => ArborMixinDeclaration[];
	inlineBody: () => ArborMixinBody;
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

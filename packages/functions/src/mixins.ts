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
	isFunctionParamWithMeta,
	ParamsAsCallInputs,
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

export function isMixinPropertyDeclaration(
	entry: ArborMixinBodyEntry,
): entry is ArborMixinDeclaration {
	return 'prop' in entry;
}

export function isMixinScope(
	entry: ArborMixinBodyEntry,
): entry is ArborMixinScope {
	return 'scope' in entry;
}

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
		if (isMixinPropertyDeclaration(entry)) {
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
			if (isMixinPropertyDeclaration(entry)) {
				return `${entry.prop}: ${printEquation(entry.value)};`;
			}

			if (isMixinScope(entry)) {
				return `${entry.scope} { ${printBody(entry.children)} }`;
			}

			return '';
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
 *   definition: (css, { parameters }) => ({
 *     '--shadow': css`0 0 0 0 transparent`,
 *     '--ring': css`0 0 0 0 ${parameters[0]}`,
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
		const cssBody = printBody(body);

		return {
			[MIXIN_BRAND]: true as const,
			name: cssName,
			description,
			body,
			definition: `@mixin ${cssName}${paramsAsString(parameters)} { ${cssBody} }`,
			apply: (params) => {
				// we "apply" a mixin within another mixin by assigning
				// the provided parameters to properties matching their names,
				// prepending that to this mixin's body statements, and
				// returning it all.

				const parameterDeclarations: ArborMixinDeclaration[] = [];
				for (let index = 0; index < parameters.length; index++) {
					const parameter = parameters[index];
					const cssParameterName =
						isFunctionParamWithMeta(parameter) ? parameter.name : parameter;
					const fallback =
						isFunctionParamWithMeta(parameter) ? parameter.fallback : undefined;
					parameterDeclarations.push({
						prop: cssParameterName,
						value: css`
							${params[index] ?? fallback ?? ''}
						`,
					});
				}

				return [...parameterDeclarations, ...body];
			},
			parameters,
			contributeTokens,
		};
	};
}

export type ArborMixin<
	TParams extends FunctionParams,
	TTokens extends TokenSchema = TokenSchema,
> = {
	[MIXIN_BRAND]: true;
	name: string;
	description?: string;
	body: ArborMixinBody;
	definition: string;
	/**
	 * Computes the mixin's body based on provided parameters. This
	 * can be used to compose mixins together, by applying one mixin from
	 * an extended preset "into" another mixin you define by spreading the
	 * result of this method.
	 *
	 * @example
	 * const baseMixin = createMixin('base', {
	 *   parameters: ['--color'] as const,
	 *   definition: (colorParam) => ({
	 *     color: colorParam,
	 *     padding: '8px',
	 *   }),
	 * });
	 *
	 * const extendedMixin = createMixin('extended', {
	 *   definition: (css, { parameters }, { mixins }) => ({
	 *     ...mixins.base.apply('red'),
	 *     background: 'black',
	 *   }),
	 * });
	 */
	apply: (params: ParamsAsCallInputs<TParams>) => MixinBodyList;
	parameters: TParams;
	contributeTokens: TTokens;
};

export type PresetMixins = Record<string, ArborMixin<any>>;

export function isMixin(value: unknown): value is ArborMixin<any> {
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

import {
	css,
	Css,
	CssInterpolation,
	CssTemplate,
	isCss,
	printCss,
} from '@arbor-css/css-eval';
import {
	convertSimpleTokenSchema,
	CreateToken,
	SimpleTokensAsTokenDefinitions,
	SimpleTokenSchema,
	Token,
	TokenSchema,
} from '@arbor-css/tokens';
import {
	applyParameters,
	FunctionParams,
	paramAsToken,
	ParamsAsCallInputs,
	paramsAsInterpolations,
	ParamsAsInterpolations,
	paramsAsString,
} from './common.js';

export const DEFAULT_MIXIN_NAME_PREFIX = '--mx-';

const MIXIN_BRAND = '@@MIXIN@@';

export type ArborMixinDeclaration = {
	prop: string;
	value: Css;
};

export type ArborMixinScope = {
	scope: string;
	children: ArborMixinBody;
};

export type ArborMixinBodyEntry = ArborMixinDeclaration | ArborMixinScope;
export type ArborMixinBody = ArborMixinBodyEntry[];

type MixinValue = CssInterpolation | Css;
type MixinScopedBodyObject = Record<string, MixinValue>;
type MixinBodyObject = Record<
	string,
	MixinValue | MixinScopedBodyObject | MixinBodyList
>;
export type MixinBodyListItem =
	| {
			prop: string;
			value: MixinValue;
	  }
	| {
			scope: string;
			children: MixinBodyObject | MixinBodyList;
	  }
	| MixinBodyObject;
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

function toCss(value: MixinValue): Css {
	if (isCss(value)) {
		return value;
	}

	return css`
		${value}
	` as Css;
}

/**
 * The definition returned by a mixin's `definition` callback.
 * - Stylesheet form: `css\`color: red;\`` (multi-line template with declarations)
 *
 * Note: the `css\`\`` tagged template literal always returns `Css` by type,
 * but at runtime, a template containing property declarations (`;` at top level)
 * or scoped blocks (`{...}`) produces a `CssStylesheet`. The mixin factory
 * detects this at runtime using `isCssStylesheet()`.
 */
export type ArborMixinDefinition = Css;

export interface CreateMixinParameters<
	TParams extends FunctionParams,
	TTokens extends SimpleTokenSchema = SimpleTokenSchema,
> {
	description?:
		| string
		| ((info: {
				parameters: ParamsAsInterpolations<TParams>;
				tokens: SimpleTokensAsTokenDefinitions<TTokens>;
		  }) => string);
	parameters?: TParams;
	definition: (
		css: CssTemplate,
		inputs: {
			parameters: ParamsAsInterpolations<TParams>;
			tokens: SimpleTokensAsTokenDefinitions<TTokens>;
		},
	) => ArborMixinDefinition;
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
	config: CreateMixinParameters<TParams, TTokens>,
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

		const tokensAndParams = {
			parameters: paramsAsInterpolations(parameters, name),
			tokens: contributeTokens,
		};

		const rawDefinition = definition(css, tokensAndParams);
		// css`` returns Css by TS type but may actually produce a CssStylesheet
		// at runtime when the template contains property declarations or blocks.
		if (rawDefinition.type !== 'stylesheet') {
			throw new Error(
				`Mixin definition must be a CSS declaration block or contain scoped blocks (received: ${printCss(rawDefinition)}) If you intended to return a single equation, wrap it in a declaration, e.g. css\`--value: ${rawDefinition};\``,
			);
		}

		const parameterTokens = parameters.map((p) => paramAsToken(p, name));

		return {
			[MIXIN_BRAND]: true as const,
			name: cssName,
			description:
				typeof description === 'function' ?
					description(tokensAndParams)
				:	description,
			body: rawDefinition,
			definition: `@mixin ${cssName}${paramsAsString(parameters, {
				nonce: name,
			})} { ${printCss(rawDefinition)} }`,
			apply: (values) => {
				// we "apply" a mixin within another mixin by assigning
				// the provided parameters to properties matching their names,
				// prepending that to this mixin's body statements, and
				// returning it all as a CssStylesheet fragment.

				const parameterDeclarations: Css[] = [];
				applyParameters(parameters, values, name, (name, value) => {
					parameterDeclarations.push(css`
						${name}: ${value};
					`);
				});

				return css`
					${parameterDeclarations} ${rawDefinition}
				`;
			},
			parameters,
			parameterTokens,
			contributeTokens,
			signature: `${cssName}${paramsAsString(parameters, {
				keepEmpty: false,
			})}`,
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
	body: Css;
	definition: string;
	/**
	 * Computes the mixin's body based on provided parameters and returns it
	 * as a {@link CssStylesheet} fragment. This can be used to compose mixins
	 * together by interpolating the result into a `css\`\`` template:
	 *
	 * @example
	 * const baseMixin = createMixin('base', {
	 *   parameters: ['--color'] as const,
	 *   definition: (css, { parameters: [color] }) => css`
	 *     color: ${color};
	 *     padding: 8px;
	 *   `,
	 * });
	 *
	 * const extendedMixin = createMixin('extended', {
	 *   definition: (css, { parameters: [color] }) => css`
	 *     ${baseMixin.apply({ '--color': color })}
	 *     background: black;
	 *   `,
	 * });
	 */
	apply: (params: ParamsAsCallInputs<TParams>) => Css;
	parameters: TParams;
	parameterTokens: Token[];
	contributeTokens: TTokens;
	/**
	 * A printed representation of the mixin call signature, for use in
	 * documentation and error messages
	 *
	 * @example
	 * --mx-shadow(--default-ring-color <color>)
	 */
	signature: string;
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

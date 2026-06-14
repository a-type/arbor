import {
	CalcInterpolation,
	css,
	Css,
	type CssStylesheet,
	type CssStylesheetNode,
	type Equation,
	isCalcEquation,
	isCssStylesheet,
	printEquation,
} from '@arbor-css/calc';
import {
	convertSimpleTokenSchema,
	CreateToken,
	isToken,
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

function toEquation(value: MixinValue): Equation {
	if (isCalcEquation(value)) {
		return value;
	}

	return css`
		${value}
	` as Equation;
}

/**
 * Converts a `CssStylesheet` (from a `css\`\`` template literal) into a
 * normalized `ArborMixinBody`. This allows mixin `definition` callbacks to
 * return either the legacy object/array form or a `css\`\`` template result.
 */
function stylesheetToMixinBody(stylesheet: CssStylesheet): ArborMixinBody {
	return stylesheetNodesToMixinBody(stylesheet.children);
}

function stylesheetNodesToMixinBody(
	nodes: CssStylesheetNode[],
): ArborMixinBody {
	const result: ArborMixinBody = [];
	for (const node of nodes) {
		if (node.type === 'declaration') {
			result.push({ prop: node.property, value: node.value });
		} else if (node.type === 'block') {
			result.push({
				scope: node.scope,
				children: stylesheetNodesToMixinBody(node.children),
			});
		} else if (node.type === 'fragment') {
			result.push(...stylesheetNodesToMixinBody(node.children));
		}
	}
	return result;
}

/**
 * Converts a normalized `ArborMixinBody` into a `CssStylesheet` fragment.
 * Used by `.apply()` to return a stylesheet that can be interpolated into
 * other `css\`\`` templates.
 */
function mixinBodyToStylesheet(body: ArborMixinBody): CssStylesheet {
	return {
		type: 'stylesheet',
		children: mixinBodyToStylesheetNodes(body),
	};
}

function mixinBodyToStylesheetNodes(body: ArborMixinBody): CssStylesheetNode[] {
	return body.map((entry): CssStylesheetNode => {
		if (isMixinPropertyDeclaration(entry)) {
			return {
				type: 'declaration',
				property: entry.prop,
				value: entry.value,
			};
		}
		return {
			type: 'block',
			scope: entry.scope,
			children: mixinBodyToStylesheetNodes(entry.children),
		};
	});
}

export function normalizeMixinBody(
	body: MixinBodyObject | MixinBodyList,
): ArborMixinBody {
	if (Array.isArray(body)) {
		const collected: ArborMixinBody = [];
		body.forEach((item) => {
			if ('scope' in item) {
				collected.push({
					scope: item.scope,
					children: normalizeMixinBody(item.children),
				});
			} else if ('prop' in item) {
				collected.push({
					prop: item.prop,
					value: toEquation(item.value),
				});
			} else {
				collected.push(...normalizeMixinBody(item));
			}
		});

		return collected;
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
				children: normalizeMixinBody(value as MixinBodyObject | MixinBodyList),
			};
		}

		return {
			prop: propOrScope,
			value: toEquation(value as MixinValue),
		};
	});
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

/**
 * The definition returned by a mixin's `definition` callback.
 * - Stylesheet form: `css\`color: red;\`` (multi-line template with declarations)
 *
 * Note: the `css\`\`` tagged template literal always returns `Equation` by type,
 * but at runtime, a template containing property declarations (`;` at top level)
 * or scoped blocks (`{...}`) produces a `CssStylesheet`. The mixin factory
 * detects this at runtime using `isCssStylesheet()`.
 */
export type ArborMixinDefinition = Equation;

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
		css: Css,
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

		const rawDefinition = definition(css as Css, tokensAndParams);
		// css`` returns Equation by TS type but may actually produce a CssStylesheet
		// at runtime when the template contains property declarations or blocks.
		if (!isCssStylesheet(rawDefinition)) {
			throw new Error(
				`Mixin definition must be a CSS declaration block or contain scoped blocks (received: ${printEquation(rawDefinition)}) If you intended to return a single equation, wrap it in a declaration, e.g. css\`--value: ${rawDefinition};\``,
			);
		}
		const body = stylesheetToMixinBody(rawDefinition);
		const cssBody = printBody(body);

		const parameterTokens = parameters.map((p) => paramAsToken(p, name));

		return {
			[MIXIN_BRAND]: true as const,
			name: cssName,
			description:
				typeof description === 'function' ?
					description(tokensAndParams)
				:	description,
			body,
			definition: `@mixin ${cssName}${paramsAsString(parameters, {
				nonce: name,
			})} { ${cssBody} }`,
			apply: (values) => {
				// TODO: convert this to directly pass property assignments
				// into a CssStylesheet via css`` templating, rather than
				// constructing an intermediate array of declarations and
				// passing it through mixinBodyToStylesheet.

				// we "apply" a mixin within another mixin by assigning
				// the provided parameters to properties matching their names,
				// prepending that to this mixin's body statements, and
				// returning it all as a CssStylesheet fragment.

				const parameterDeclarations: ArborMixinDeclaration[] = [];
				applyParameters(parameters, values, name, (name, value) => {
					parameterDeclarations.push({
						prop: name,
						value,
					});
				});

				return mixinBodyToStylesheet([...parameterDeclarations, ...body]);
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
	body: ArborMixinBody;
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
	apply: (params: ParamsAsCallInputs<TParams>) => CssStylesheet;
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

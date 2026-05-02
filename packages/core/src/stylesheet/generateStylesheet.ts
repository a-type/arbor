import { CompiledColors } from '@arbor-css/colors';
import { $globalProps } from '@arbor-css/globals';
import {
	flattenToPropsList,
	ModeSchemaLevel,
	modeToCss,
} from '@arbor-css/modes';
import {
	createToken,
	isToken,
	selfReferencedProps,
	TokenSchema,
	tokenSchemaToList,
} from '@arbor-css/tokens';
import { CompiledTypography } from '@arbor-css/typography';
import { ArborConfig } from '../config.js';
import { $systemProps, CompiledShadows, CompiledSpacing } from '../index.js';
import { convertStructure } from '../util/convertStructure.js';

const noPreference = `, (prefers-color-scheme: no-preference)`;

export function generateStylesheet<
	TModeShape extends ModeSchemaLevel,
	TCompiledColors extends CompiledColors<any, any>,
	TTypography extends CompiledTypography<any>,
	TSpacing extends CompiledSpacing<any>,
	TShadows extends CompiledShadows<any>,
	TOtherTokens extends TokenSchema,
>(
	config: ArborConfig<
		TModeShape,
		TCompiledColors,
		TTypography,
		TSpacing,
		TShadows,
		TOtherTokens
	>,
): string {
	const defaultMode = config.primitives.defaultScheme ?? 'light';

	/**
	 * Each scheme generates a full set of CSS color properties
	 * which are prefixed with its tag. The application of a scheme
	 * then sets the "official" version of each property to the
	 * tagged one when it is applied.
	 */
	function getSchemeRootPropertiesCss(schemeName: string) {
		const values = flattenAndApplyTokenValues(
			config.primitives.$tokens.colors,
			config.primitives.colors[schemeName],
			{ prefix: config.primitives.schemeTags[schemeName] ?? schemeName },
		);

		return formatPropertiesToCss(values);
	}

	function schemeApplicationCss(schemeName: string) {
		const values = selfReferencedProps(config.primitives.$tokens.colors, {
			valuePrefix: config.primitives.schemeTags[schemeName] ?? schemeName,
		});
		return `${$systemProps.labels.scheme.assign(schemeName)}
	${formatPropertiesToCss(values)}
	`;
	}

	const allModeProps = Array.from(
		new Set(
			Object.values(config.modes).flatMap((mode) => {
				const shape = mode.schema.$tokens;
				return flattenToPropsList(shape);
			}),
		),
	);

	// replace scheme names with their tags if they are provided
	const schemeColorsWithTags = Object.keys(config.primitives.colors).reduce(
		(acc, scheme) => {
			const key = config.primitives.schemeTags[scheme] ?? scheme;
			acc[key] = config.primitives.colors[scheme];
			return acc;
		},
		{} as Record<string, Record<string, any>>,
	);
	// convert all tagged scheme colors to Tokens
	const allColorTokens = tokenSchemaToList(
		convertStructure(schemeColorsWithTags, isToken, (_, path) =>
			createToken(path.join('-'), { type: 'color' }),
		),
	);

	return `/* Auto-generated CSS - do not edit directly */
:root {
	/* Assign user globals */
	${printTokens($globalProps, config.primitives.globals)}

	/* Raw scheme ranges */
	${Object.keys(config.primitives.colors)
		.map((schemeName) => getSchemeRootPropertiesCss(schemeName))
		.join('\n')}

	/* Dark/Light schemes are assigned to built-in device preferences */
	@media (prefers-color-scheme: light)${
		defaultMode === 'light' ? noPreference : ''
	} {
		${schemeApplicationCss('light')}
	}

	@media (prefers-color-scheme: dark)${
		defaultMode === 'dark' ? noPreference : ''
	} {
		${schemeApplicationCss('dark')}
	}

	/* Other primitives */
	${printTokens(config.primitives.$tokens.typography, config.primitives.typography.levels)}
	${printTokens(config.primitives.$tokens.spacing, config.primitives.spacing.levels)}
	${printTokens(config.primitives.$tokens.shadows, config.primitives.shadows.levels)}
}

/* Scheme classes */
${Object.keys(config.primitives.colors)
	.map(
		(schemeName) => `.\\@scheme-${schemeName}, [data-scheme-${schemeName}] {
	${schemeApplicationCss(schemeName)}
}`,
	)
	.join('\n\n')}

${Object.entries(config.modes)
	.map(([modeName, modeValue]) => {
		return `/* Mode: ${modeName} */
.\\@mode-${modeName}, [data-mode-${modeName}], ${Object.keys(
			config.primitives.colors,
		)
			.map(
				(schemeName) => `:where(.\\@mode-${modeName}) .\\@scheme-${schemeName}`,
			)
			.join(', ')} {
	${$systemProps.labels.mode.assign(modeName)}
	${formatPropertiesToCss(modeToCss(modeValue.values, modeValue.schema.$tokens, { modeName }))}
}
`;
	})
	.join('\n\n')}

/* Custom properties for each primitive color */
${allColorTokens.map((token) => token.definition).join('\n')}

/* Custom properties for each mode property */
${allModeProps.map((PROP) => PROP.definition).join('\n\n')}
`;
}

function formatPropertiesToCss(properties: Record<string, string>): string {
	return Object.entries(properties)
		.map(([key, value]) => `${key}: ${value};`)
		.join(' ');
}

function flattenAndApplyTokenValues(
	tokens: TokenSchema,
	values: Record<string, any>,
	{ prefix }: { prefix?: string } = {},
) {
	const result: Record<string, string> = {};
	function walk(
		tokenNode: Record<string, any>,
		valueNode: Record<string, any>,
		path: string[] = [],
	) {
		for (const key in tokenNode) {
			const tokenCurrent = tokenNode[key];
			if (!valueNode[key]) {
				throw new Error(
					`Missing value for token ${tokenCurrent.name} at path ${[...path, key].join('.')} (values: ${JSON.stringify(valueNode)})`,
				);
			}
			const valueCurrent = valueNode[key];
			const currentPath = [...path, key];
			if (isToken(tokenCurrent)) {
				const tokenValue = valueCurrent as string;
				if (tokenValue === undefined) {
					throw new Error(
						`Missing value for token ${tokenCurrent.name} at ${currentPath.join('.')} (values: ${JSON.stringify(valueNode)})`,
					);
				}
				if (prefix) {
					result[tokenCurrent.prefixed(prefix).name] = tokenValue;
				} else {
					result[tokenCurrent.name] = tokenValue;
				}
			} else if (typeof tokenCurrent === 'object') {
				walk(tokenCurrent, valueCurrent, currentPath);
			}
		}
	}
	walk(tokens, values);
	return result;
}

function printTokens(
	tokens: TokenSchema,
	values: Record<string, any>,
	{ prefix }: { prefix?: string } = {},
) {
	return formatPropertiesToCss(
		flattenAndApplyTokenValues(tokens, values, { prefix }),
	);
}

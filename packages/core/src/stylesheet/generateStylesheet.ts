import { CompiledColors } from '@arbor-css/colors';
import { $globalProps, $systemProps } from '@arbor-css/globals';
import {
	flattenToPropsList,
	ModeSchemaLevel,
	modeToCss,
} from '@arbor-css/modes';
import { CompiledShadows } from '@arbor-css/shadows';
import { CompiledSpacing } from '@arbor-css/spacing';
import {
	createToken,
	isToken,
	selfReferencedProps,
	TokenSchema,
	tokenSchemaToList,
} from '@arbor-css/tokens';
import { CompiledTypography } from '@arbor-css/typography';
import { convertStructure } from '@arbor-css/util';
import { ArborConfig } from '../config.js';
import { flattenAndApplyTokenValues } from '../util/flattenAndApplyTokenValues.js';
import { formatObjectToCss } from '../util/formatObjectToCss.js';
import { printTokens } from '../util/printTokens.js';

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
	{
		layer: cascadeLayerName = 'arbor',
	}: {
		layer?: string | false;
	} = {},
): string {
	const defaultScheme = config.primitives.defaultScheme ?? 'light';
	const baseMode = config.modes.base;

	/**
	 * Each scheme generates a full set of CSS color properties
	 * which are prefixed with its tag. The application of a scheme
	 * then sets the "official" version of each property to the
	 * tagged one when it is applied.
	 */
	function getSchemeRootPropertiesCss(schemeName: string) {
		const values = flattenAndApplyTokenValues(
			config.primitives.$tokens.colors,
			config.primitives.colors[schemeName].colors,
			{ prefix: config.primitives.schemeTags[schemeName] ?? schemeName },
		);

		return formatObjectToCss(values);
	}

	function schemeApplicationCss(schemeName: string) {
		const values = selfReferencedProps(config.primitives.$tokens.colors, {
			valuePrefix: config.primitives.schemeTags[schemeName] ?? schemeName,
		});
		return `${$systemProps.labels.scheme.assign(schemeName)}
	${$systemProps.scheme.invertMultiplier.assign(
		config.primitives.colors[schemeName].isDark ? -1 : 1,
	)}
	${$systemProps.scheme.whenDark.assign(schemeName === 'dark' ? 1 : 0)}
	${$systemProps.scheme.whenLight.assign(schemeName === 'light' ? 1 : 0)}
	${formatObjectToCss(values)}
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
			acc[key] = config.primitives.colors[scheme].colors;
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
${cascadeLayerName ? `@layer ${cascadeLayerName} {` : ''}
:root {
	/* Assign user globals */
	${printTokens($globalProps, config.primitives.globals)}
	/* By default we set the font size */
	font-size: ${$globalProps.baseFontSize.var};

	/* Raw scheme ranges */
	${Object.keys(config.primitives.colors)
		.map((schemeName) => getSchemeRootPropertiesCss(schemeName))
		.join('\n')}

	/* Dark/Light schemes are assigned to built-in device preferences */
	@media (prefers-color-scheme: light)${
		defaultScheme === 'light' ? noPreference : ''
	} {
		${schemeApplicationCss('light')}
	}

	@media (prefers-color-scheme: dark)${
		defaultScheme === 'dark' ? noPreference : ''
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
		(schemeName) => `.\\@scheme-${schemeName}, [data-scheme-${schemeName}=""] {
	${schemeApplicationCss(schemeName)}
}`,
	)
	.join('\n\n')}

${Object.entries(config.modes)
	.map(([modeName, modeValue]) => {
		return `/* Mode: ${modeName} */
${modeName === 'base' ? ':root,' : ''} .\\@mode-${modeName}, [data-mode-${modeName}=""], ${Object.keys(
			config.primitives.colors,
		)
			.map((schemeName) =>
				[
					`:where(.\\@mode-${modeName}) .\\@scheme-${schemeName}`,
					`:where([data-mode-${modeName}=""]) .\\@scheme-${schemeName}`,
					modeName === 'base' ? `:root .\\@scheme-${schemeName}` : null,
				]
					.filter((s) => !!s)
					.join(', '),
			)
			.join(', ')} {
	${$systemProps.labels.mode.assign(modeName)}
	${modeToCss(modeValue, baseMode)}
}
`;
	})
	.join('\n\n')}

/* Custom properties for each primitive color */
${allColorTokens.map((token) => token.definition).join('\n')}

/* Custom properties for each mode property */
${allModeProps.map((PROP) => PROP.definition).join('\n\n')}

${cascadeLayerName ? `}` : ''}
`.trim();
}

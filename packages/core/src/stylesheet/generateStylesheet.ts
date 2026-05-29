import { AnyArborPreset, getInternals } from '@arbor-css/preset/config';
import {
	flattenTokenSchema,
	isToken,
	selfReferencedProps,
	tokenSchemaToList,
} from '@arbor-css/tokens';
import { convertStructure } from '@arbor-css/util';
import { flattenAndApplyTokenValues } from '../util/flattenAndApplyTokenValues.js';
import { formatObjectToCss } from '../util/formatObjectToCss.js';
import { printTokens } from '../util/printTokens.js';
import { modeToCss } from './modeToCss.js';

const noPreference = `, (prefers-color-scheme: no-preference)`;

export function generateStylesheet(
	config: AnyArborPreset,
	{
		layer: cascadeLayerName = 'arbor',
	}: {
		layer?: string | false;
	} = {},
): string {
	const { defaultScheme, modes, primitiveValues } = getInternals(config);
	const systemProps = config.$.system;
	const globalProps = systemProps.global;

	/**
	 * Each scheme generates a full set of CSS color properties
	 * which are prefixed with its tag. The application of a scheme
	 * then sets the "official" version of each property to the
	 * tagged one when it is applied.
	 */
	function getSchemeRootPropertiesCss(schemeName: string) {
		const values = flattenAndApplyTokenValues(
			config.$.primitives.color,
			primitiveValues.color[schemeName].colors,
			{ prefix: schemeName },
		);

		return formatObjectToCss(values);
	}

	function schemeApplicationCss(schemeName: string) {
		const scheme = primitiveValues.color[schemeName];
		const values = selfReferencedProps(config.$.primitives.color, {
			valuePrefix: schemeName,
		});
		return `${systemProps.meta.schemeName.assign(schemeName)}
	${systemProps.meta.scheme.invertMultiplier.assign(scheme.isDark ? -1 : 1)}
	${systemProps.meta.scheme.whenDark.assign(scheme.isDark ? 1 : 0)}
	${systemProps.meta.scheme.whenLight.assign(scheme.isDark ? 0 : 1)}
	${systemProps.meta.scheme.trueLight.assign(scheme.isDark ? 'black' : 'white')}
	${systemProps.meta.scheme.trueHeavy.assign(scheme.isDark ? 'white' : 'black')}
	${formatObjectToCss(values)}
	`;
	}

	const allModeProps = flattenTokenSchema(config.$.mode);

	// replace scheme names with their tags if they are provided
	const schemeColorsWithTags = Object.keys(primitiveValues.color).reduce(
		(acc, key) => {
			acc[key] = primitiveValues.color[key].colors;
			return acc;
		},
		{} as Record<string, Record<string, any>>,
	);
	// convert all tagged scheme colors to Tokens
	const createToken = config.context.createPrimitiveToken;
	const allColorTokens = tokenSchemaToList(
		convertStructure(schemeColorsWithTags, isToken, (_, path) =>
			createToken(path.join('-'), { type: 'color' }),
		),
	);

	return `/* Auto-generated CSS - do not edit directly */
${cascadeLayerName ? `@layer ${cascadeLayerName} {` : ''}
:root {
	/* Assign user globals */
	${printTokens(globalProps, config.context.globals)}
	/* By default we set the font size */
	font-size: ${globalProps.baseFontSize.var};

	/* Raw scheme ranges */
	${Object.keys(primitiveValues.color)
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
	${printTokens(config.$.primitives.typography, primitiveValues.typography.levels)}
	${printTokens(config.$.primitives.spacing, primitiveValues.spacing.levels)}
	${printTokens(config.$.primitives.shadow, primitiveValues.shadow.levels)}
	${printTokens(config.$.primitives.easing, primitiveValues.easing)}
	${printTokens(config.$.primitives.duration, primitiveValues.duration)}
}

/* Scheme classes */
${Object.keys(primitiveValues.color)
	.map(
		(schemeName) => `.\\@scheme-${schemeName}, [data-scheme-${schemeName}=""] {
	${schemeApplicationCss(schemeName)}
}`,
	)
	.join('\n\n')}

${[['base', config.baseMode] as const, ...Object.entries(modes)]
	.map(([modeName, modeValue]) => {
		return `/* Mode: ${modeName} */
${modeName === 'base' ? ':root, :root [class^="\\@scheme-"], ' : ''}${modeToCss(modeValue, config)}
`;
	})
	.join('\n\n')}

/* Function definitions */
${Object.values(config.functions)
	.map((fn) => fn.definition)
	.filter(Boolean)
	.join('\n\n')}

${
	/*Object.values(config.mixins)
	.map((mixin) => mixin.definition)
	.filter(Boolean)
	.join('\n\n')*/ ''
}

${allColorTokens
	.map((token) => token.definition)
	.filter(Boolean)
	.join('\n')}
${allModeProps
	.map((PROP) => PROP.definition)
	.filter(Boolean)
	.join('\n\n')}

${cascadeLayerName ? `}` : ''}
`
		.trim()
		.replace(/\n+$/, '\n');
}

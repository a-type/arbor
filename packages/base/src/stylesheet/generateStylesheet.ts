import { ArborConfig } from '../config.js';
import { ColorEvaluationContext } from '../core/color.js';
import { createProp, prefixProp } from '../core/properties.js';
import { ColorRangeItem, createNeutralDerivedRange } from '../core/ranges.js';
import {
	flattenToPropsList,
	getPropShapeFromMode,
	ModeSchemaLevel,
	modeToCss,
} from '../modes/modeSchema.js';

const noPreference = `, (prefers-color-scheme: no-preference)`;

export function generateStylesheet<ModeShape extends ModeSchemaLevel>(
	config: ArborConfig<ModeShape>,
) {
	const defaultMode = config.primitives.defaultScheme ?? 'light';

	const evalContext: ColorEvaluationContext = {
		propSchema: config.primitives.$props,
		appliedProperties: {
			[config.primitives.$props.user.saturation.name]:
				config.primitives.globals.saturation.toString(),
		},
	};

	function getSchemeColorRanges(schemeName: string, prefix?: string) {
		const scheme = config.primitives.schemes[schemeName]!;
		return [
			...Object.entries(config.primitives.namedHues).map(([name, hue]) =>
				colorRangeToCss(
					name,
					scheme.getColorRange({
						sourceHue: hue,
						context: evalContext,
						rangeNames: config.primitives.rangeSteps,
					}),
					evalContext,
					prefix,
				),
			),
		];
	}

	/**
	 * Each scheme generates a full set of CSS color properties
	 * which are prefixed with its tag. The application of a scheme
	 * then sets the "official" version of each property to the
	 * tagged one when it is applied.
	 */
	function getSchemeRootPropertiesCss(schemeName: string) {
		const scheme = config.primitives.schemes[schemeName]!;
		const hueRanges = getSchemeColorRanges(schemeName, scheme.tag);

		return hueRanges.map(formatPropertiesToCss).join(' ');
	}

	function schemeApplicationCss(schemeName: string) {
		const scheme = config.primitives.schemes[schemeName]!;
		const ranges = getSchemeColorRanges(schemeName);
		const rangeProperties = Object.keys(
			ranges.reduce((acc, range) => ({ ...acc, ...range }), {}),
		);
		return `${config.primitives.$props.labels.scheme.assign(schemeName)}
	${rangeProperties
		.map((prop) => `${prop}: var(${prefixProp(prop, scheme.tag)});`)
		.join('\n')}
	`;
	}

	const allColorPropertyNamesWithSchemeTags = Array.from(
		new Set(
			Object.entries(config.primitives.schemes).flatMap(
				([schemeName, scheme]) => {
					return getSchemeColorRanges(schemeName)
						.flatMap((item) => Object.keys(item))
						.flatMap((name) => [name, prefixProp(name, scheme.tag)]);
				},
			),
		),
	);

	const allModeProps = Array.from(
		new Set(
			Object.values(config.modes).flatMap((mode) => {
				const shape = getPropShapeFromMode(mode);
				return flattenToPropsList(shape);
			}),
		),
	);

	return `/* Auto-generated CSS - do not edit directly */
:root, body {
	/* Assign user globals */
	${Object.entries(config.primitives.$props.user)
		.map(([key, prop]) => prop.assign())
		.join('\n')}

	/* Raw scheme ranges */
	${Object.keys(config.primitives.schemes)
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
}

/* Scheme class names */
${Object.keys(config.primitives.schemes)
	.map(
		(schemeName) => `.\\@scheme-${schemeName} {
	${schemeApplicationCss(schemeName)}
}`,
	)
	.join('\n\n')}

${Object.entries(config.modes)
	.map(([modeName, modeValue]) => {
		return `/* Mode: ${modeName} */
.\\@mode-${modeName}, ${Object.keys(config.primitives.schemes)
			.map(
				(schemeName) => `:where(.\\@mode-${modeName}) .\\@scheme-${schemeName}`,
			)
			.join(', ')} {
	${config.primitives.$props.labels.mode.assign(modeName)}
	${formatPropertiesToCss(modeToCss(modeValue, getPropShapeFromMode(modeValue)))}
}
`;
	})
	.join('\n\n')}

${/* Custom properties for each color step */ ''}
${allColorPropertyNamesWithSchemeTags
	.map((name) => createProp(name, { type: 'color' }).definition)
	.join('\n\n')}

${allModeProps.map((PROP) => PROP.definition).join('\n\n')}
`;
}

function colorRangeToCss(
	name: string,
	range: ColorRangeItem[],
	context: ColorEvaluationContext,
	prefix?: string,
): Record<string, string> {
	const colorProps = range.map((item) =>
		createProp(`${prefix ? `${prefix}-` : ''}${name}-${item.name}`, {
			type: 'color',
		}),
	);
	const colors = range.reduce(
		(acc, item, i) => {
			const prop = colorProps[i];
			acc[prop.name] = item.css;
			return acc;
		},
		{} as Record<string, string>,
	);

	return {
		...colors,
		...createNeutralDerivedRange(colorProps, context),
	};
}

function formatPropertiesToCss(properties: Record<string, string>): string {
	return Object.entries(properties)
		.map(([key, value]) => `${key}: ${value};`)
		.join(' ');
}

import { AnyArborPreset, getInternals } from '@arbor-css/preset/config';
import { flattenTokenSchema } from '@arbor-css/tokens';
import { modeToCss } from './modeToCss.js';

export function generateStylesheet(
	config: AnyArborPreset,
	{
		layer: cascadeLayerName = 'arbor',
	}: {
		layer?: string | false;
	} = {},
): string {
	const { modes } = getInternals(config);
	const systemProps = config.$.system;

	const allModeProps = flattenTokenSchema(config.$.mode);

	return `/* Auto-generated CSS - do not edit directly */
${cascadeLayerName ? `@layer ${cascadeLayerName} {` : ''}
${[config.baseMode, ...modes]
	.map((modeValue) => {
		return modeToCss(modeValue, config);
	})
	.join('\n\n')}

/* System scheme tokens */
@media (prefers-color-scheme: light) {
	:root {
		${systemProps.meta.scheme.trueHeavy.assign('#000')}
		${systemProps.meta.scheme.trueLight.assign('#fff')}
		${systemProps.meta.scheme.invertMultiplier.assign('1')}
		${systemProps.meta.scheme.whenDark.assign('0')}
		${systemProps.meta.scheme.whenLight.assign('1')}
	}
}
@media (prefers-color-scheme: dark) {
	:root {
		${systemProps.meta.scheme.trueHeavy.assign('#fff')}
		${systemProps.meta.scheme.trueLight.assign('#000')}
		${systemProps.meta.scheme.invertMultiplier.assign('-1')}
		${systemProps.meta.scheme.whenDark.assign('1')}
		${systemProps.meta.scheme.whenLight.assign('0')}
	}
}

/* Scheme control classes */
.\\@scheme-light {
	color-scheme: light;
	${systemProps.meta.scheme.trueHeavy.assign('#000')}
	${systemProps.meta.scheme.trueLight.assign('#fff')}
	${systemProps.meta.scheme.invertMultiplier.assign('1')}
	${systemProps.meta.scheme.whenDark.assign('0')}
	${systemProps.meta.scheme.whenLight.assign('1')}
}
.\\@scheme-dark {
	color-scheme: dark;
	${systemProps.meta.scheme.trueHeavy.assign('#fff')}
	${systemProps.meta.scheme.trueLight.assign('#000')}
	${systemProps.meta.scheme.invertMultiplier.assign('-1')}
	${systemProps.meta.scheme.whenDark.assign('1')}
	${systemProps.meta.scheme.whenLight.assign('0')}
}

/* Function definitions */
${Object.values(config.functions)
	.map((fn) => fn.definition)
	.filter(Boolean)
	.join('\n\n')}

${allModeProps
	.map((PROP) => PROP.definition)
	.filter(Boolean)
	.join('\n\n')}

${cascadeLayerName ? `}` : ''}
`
		.trim()
		.replace(/\n+$/, '\n');
}

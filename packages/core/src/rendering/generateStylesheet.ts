import { CssSimplifier } from '@arbor-css/css-eval';
import { AnyArborPreset, getInternals } from '@arbor-css/preset/config';
import { flattenTokenSchema } from '@arbor-css/tokens';
import { modeToCss } from './modeToCss.js';

export function generateStylesheet(
	config: AnyArborPreset,
	{
		layer: cascadeLayerName = 'arbor',
		skipBaking,
		simplifier,
	}: {
		layer?: string | false;
		skipBaking?: boolean;
		simplifier?: CssSimplifier;
	} = {},
): string {
	const { modes } = getInternals(config);
	const allModeProps = flattenTokenSchema(config.$.mode);

	return `/* Auto-generated CSS - do not edit directly */
	${cascadeLayerName ? `@layer ${cascadeLayerName} {` : ''}
${[config.baseMode, ...Object.values(modes)]
	.map((modeValue) => {
		return modeToCss(modeValue, config, { simplifier, skipBaking });
	})
	.join('\n\n')}
/* Function definitions */
${Object.values(config.functions)
	.map((fn) => fn.definition)
	.filter(Boolean)
	.join('\n\n')}
/* Mode property definitions, if relevant */
${allModeProps
	.map((PROP) => PROP.definition)
	.filter(Boolean)
	.join('\n\n')}
${cascadeLayerName ? `}` : ''}
`
		.trim()
		.replace(/\n+$/, '\n');
}

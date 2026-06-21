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
	const allProps = flattenTokenSchema(config.$);
	// this is needed while mixins are preprocessed out as their parameter values are captured
	// as CSS properties during transpilation. these need inherit=false, which the logic to
	// create them already embeds...
	allProps.push(
		...Object.values(config.mixins).flatMap((mixin) => mixin.parameterTokens),
	);

	return `/* Auto-generated CSS - do not edit directly */
	${cascadeLayerName ? `@layer ${cascadeLayerName} {` : ''}
${[config.baseMode, ...Object.values(modes)]
	.map((modeValue) => {
		return modeToCss(modeValue, config, { simplifier, skipBaking });
	})
	.join('\n\n')}
	${cascadeLayerName ? `}` : ''}
	/* Mode property definitions, if relevant */
	${allProps
		.map((PROP) => PROP.definition)
		.filter(Boolean)
		.join('\n\n')}
`
		.trim()
		.replace(/\n+$/, '\n');
}

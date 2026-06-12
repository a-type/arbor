import { getModeInternals, ModeInstance } from '@arbor-css/modes';
import { ArborPreset } from '@arbor-css/preset';
import { SimpleTokenSchema } from '@arbor-css/tokens';
import {
	buildModeTokenGraph,
	walkModeTokenGraph,
} from '../util/buildModeTokenGraph.js';

export function modeToCss<TModeShape extends SimpleTokenSchema>(
	mode: ModeInstance<TModeShape>,
	preset: ArborPreset<TModeShape>,
	{ skipBaking }: { skipBaking?: boolean } = {},
): string {
	const modeInternals = getModeInternals(mode);
	const graph = buildModeTokenGraph(mode, preset, {
		skipBaking,
	});
	const valuesCss = walkModeTokenGraph(graph).reduce(
		(acc, node) => `${acc}${node.token.name}: ${node.computed};\n`,
		'',
	);
	const content = [valuesCss, preset.modeSchema.extraCss]
		.filter(Boolean)
		.join('\n');

	const simpleSelector = `.\\@mode-${modeInternals.name}`;
	const selectors = [simpleSelector, ...(modeInternals.extraSelectors ?? [])];

	if (mode === preset.baseMode) {
		// base mode values are applied to :root and all scheme selectors since they can be referenced by any mode and we want them to update when the base mode changes
		selectors.push(
			...selectors.map((s) => s.replace(`.\\@mode-${mode.$name}`, ':root')),
		);
	}

	return `${selectors.join(', ')} {
	${preset.$.system.meta.modeName.assign(modeInternals.name)}
	${content}
	${modeInternals.extraCss ?? ''}
}
`
		.replace(/\s+/g, ' ')
		.replaceAll('; ', ';\n\t')
		.replaceAll('{ ', '{\n\t');
}

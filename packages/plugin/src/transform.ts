import { AnyArborPreset, generateStylesheet } from '@arbor-css/core';
import postcss from 'postcss';
import { getColorPropEntries } from './colorSystemProps.js';

const ARBOR_IMPORT_RE = /^['"]arbor:css['"]$/;

/**
 * Transforms CSS source by:
 *  1. Replacing `@import 'arbor:css'` with the generated Arbor stylesheet.
 *  2. For color-related properties, injecting Arbor system prop declarations
 *     (mirroring the behavior of the `classes` package utility rules).
 *
 * @param cssSource - Raw CSS source string
 * @param preset - Loaded Arbor preset for `@import 'arbor:css'` expansion (null to skip)
 */
export function transform(
	cssSource: string,
	preset: AnyArborPreset | null = null,
): TransformResult {
	const root = postcss.parse(cssSource);
	const colorPropEntries =
		preset?.$.system ? getColorPropEntries(preset.$.system) : {};

	// Replace @import 'arbor:css' with the full generated stylesheet
	if (preset) {
		root.walkAtRules('import', (rule) => {
			if (!ARBOR_IMPORT_RE.test(rule.params.trim())) return;
			const generated = generateStylesheet(preset as any);
			const generatedRoot = postcss.parse(generated);
			rule.replaceWith(...generatedRoot.nodes);
		});
	}

	// inject color system prop assignments to matching css properties
	root.walkDecls((decl) => {
		const systemAssignmentEntry = colorPropEntries[decl.prop];
		if (systemAssignmentEntry) {
			// Inject system color props before this declaration
			decl.cloneBefore({
				prop: systemAssignmentEntry.applied,
				value: decl.value,
				raws: {},
			});
			decl.cloneBefore({
				prop: systemAssignmentEntry.final,
				value: `var(${systemAssignmentEntry.applied})`,
				raws: {},
			});
			decl.cloneBefore({
				prop: systemAssignmentEntry.opacity,
				value: '1',
				raws: {},
			});
			for (const extra of systemAssignmentEntry.extras ?? []) {
				decl.cloneBefore({
					prop: extra.prop,
					value:
						extra.value === 'applied' ?
							`var(${systemAssignmentEntry.applied})`
						:	extra.value,
					raws: {},
				});
			}
			// Point the actual CSS property at the system final var for runtime flexibility
			decl.value = `var(${systemAssignmentEntry.final})`;
		}
	});

	return {
		css: root.toResult().css,
	};
}

export interface TransformResult {
	css: string;
}

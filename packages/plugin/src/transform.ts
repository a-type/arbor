import { generateStylesheet, Token } from '@arbor-css/core';
import postcss from 'postcss';
import { COLOR_PROP_ENTRIES } from './colorSystemProps.js';

const TOKEN_PATTERN = /\$\.([\w.]+)/g;
const ARBOR_IMPORT_RE = /^['"]arbor:css['"]$/;

/**
 * Transforms CSS source by:
 *  1. Replacing `@import 'arbor:css'` with the generated Arbor stylesheet.
 *  2. Replacing `$.token.path` references with their CSS `var(--...)` equivalents.
 *  3. For color-related properties, injecting Arbor system prop declarations
 *     (mirroring the behavior of the `classes` package utility rules).
 *
 * @param cssSource - Raw CSS source string
 * @param tokenMap - Token map for `$.x.y` replacement (null to skip)
 * @param preset - Loaded Arbor preset for `@import 'arbor:css'` expansion (null to skip)
 */
export function transform(
	cssSource: string,
	tokenMap: Map<string, Token> | null,
	preset: any | null = null,
): TransformResult {
	const warnings: string[] = [];
	const root = postcss.parse(cssSource);

	// Replace @import 'arbor:css' with the full generated stylesheet
	if (preset) {
		root.walkAtRules('import', (rule) => {
			if (!ARBOR_IMPORT_RE.test(rule.params.trim())) return;
			const generated = generateStylesheet(preset as any);
			const generatedRoot = postcss.parse(generated);
			rule.replaceWith(...generatedRoot.nodes);
		});
	}

	// Replace $.token.path references and inject color system props
	if (tokenMap) {
		root.walkDecls((decl) => {
			// Handle left-hand side token assignment: `$.token.path: value` → `--token-name: value`
			if (decl.prop.includes('$.')) {
				const propMatch = /^\$\.([\w.]+)$/.exec(decl.prop.trim());
				if (propMatch) {
					const entry = tokenMap!.get(propMatch[1]);
					if (!entry) {
						warnings.push(`Unknown token reference: $.${propMatch[1]}`);
					} else {
						decl.prop = entry.name;
					}
				}
			}

			if (!decl.value.includes('$.')) return;

			const resolvedValue = decl.value.replace(
				TOKEN_PATTERN,
				(match, path: string) => {
					const entry = tokenMap!.get(path);
					if (!entry) {
						warnings.push(`Unknown token reference: $.${path}`);
						return match;
					}
					return entry.var;
				},
			);

			const colorEntry = COLOR_PROP_ENTRIES[decl.prop];
			if (colorEntry && isSingleVar(resolvedValue)) {
				// Inject system color props before this declaration
				decl.cloneBefore({
					prop: colorEntry.applied,
					value: resolvedValue,
					raws: {},
				});
				decl.cloneBefore({
					prop: colorEntry.final,
					value: `var(${colorEntry.applied})`,
					raws: {},
				});
				decl.cloneBefore({
					prop: colorEntry.opacity,
					value: '1',
					raws: {},
				});
				for (const extra of colorEntry.extras ?? []) {
					decl.cloneBefore({
						prop: extra.prop,
						value: extra.value === 'applied' ? resolvedValue : extra.value,
						raws: {},
					});
				}
				// Point the actual CSS property at the system final var for runtime flexibility
				decl.value = `var(${colorEntry.final})`;
			} else {
				decl.value = resolvedValue;
			}
		});
	}

	return {
		css: root.toResult().css,
		warnings,
	};
}

export interface TransformResult {
	css: string;
	warnings: string[];
}

/** Returns true when a value is exactly a single `var(--xxx)` expression */
function isSingleVar(value: string): boolean {
	return /^var\(--[^)]+\)$/.test(value.trim());
}

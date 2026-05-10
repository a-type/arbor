import { ArborPreset, generateStylesheet } from '@arbor-css/core';
import { extractorArbitraryVariants } from '@unocss/extractor-arbitrary-variants';
import {
	boxShadowsBase,
	ringBase,
	transformBase,
} from '@unocss/preset-mini/rules';
import { entriesToCss, Preset, transformerVariantGroup } from 'unocss';
import { rules } from './rules/index.js';
import { createTheme, ThemeConfig } from './theme/index.js';
import { variants } from './variants/index.js';

export type { Theme } from './theme/types.js';
export type { ThemeConfig };

export function presetArbor(
	arbor: ArborPreset<any, any>,
	options?: {
		preflight?: 'on-demand' | boolean;
		theme?: ThemeConfig;
	},
): Preset<any> {
	return {
		name: 'arbor',
		rules,
		theme: createTheme(arbor, options?.theme),
		variants,
		transformers: [transformerVariantGroup()],
		extractorDefault: extractorArbitraryVariants(),
		preflights: [
			{
				layer: 'preflights',
				getCSS({ generator }) {
					let entries = Object.entries({
						...transformBase,
						...boxShadowsBase,
						...ringBase,
					});
					if (options?.preflight === 'on-demand') {
						const keys = new Set(
							Array.from(generator.activatedRules)
								.map((r) => r[2]?.custom?.preflightKeys)
								.filter(Boolean)
								.flat(),
						);
						entries = entries.filter(([k]) => keys.has(k));
					}

					if (entries.length > 0) {
						let css = entriesToCss(entries);
						css = css.replace(/--un-/g, `--🍂-`);
						const roots = ['*,::before,::after', '::backdrop'];
						return roots.map((root) => `${root}{${css}}`).join('');
					}
				},
			},
			{
				layer: 'base',
				getCSS: () => {
					return generateStylesheet(arbor);
				},
			},
		],
	};
}

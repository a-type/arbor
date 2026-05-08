import { $systemProps } from '@arbor-css/core';
import type { Rule } from '@unocss/core';
import { colorableShadows } from '@unocss/preset-mini/utils';
import { Theme } from '../theme/types.js';
import { h } from '../util/h.js';
import { getFromTheme } from '../util/themeOrLiteral.js';

export const shadowRules: Rule<Theme>[] = [
	// shadow sizes
	[
		/^shadow(?:-(.+))?$/,
		([, size], { theme }) => {
			const asLiteral = h.bracket(size);
			if (asLiteral) {
				return {
					'--🍂-shadow': colorableShadows(
						asLiteral,
						$systemProps.dynamic.shadowColor.name,
					).join(','),
					'box-shadow':
						'var(--🍂-ring-offset-shadow), var(--🍂-ring-shadow), var(--🍂-shadow)',
				};
			}

			const x = getFromTheme(size, theme, {
				startFrom: 'shadow-x',
				trySuffixes: ['x', 'offsetX', 'xOffset'],
			});
			const y = getFromTheme(size, theme, {
				startFrom: 'shadow-y',
				trySuffixes: ['y', 'offsetY', 'yOffset'],
			});
			const blur = getFromTheme(size, theme, {
				startFrom: 'shadow-blur',
				trySuffixes: ['blur'],
			});
			const spread = getFromTheme(size, theme, {
				startFrom: 'shadow-spread',
				trySuffixes: ['spread'],
			});
			const color = getFromTheme(size, theme, {
				startFrom: 'shadow-color',
				trySuffixes: ['color'],
			});

			if (!(x && y && blur && spread && color)) {
				return;
			}

			const shadowValue = colorableShadows(
				`var(--🍂-shadow-inset) ${x ?? '0'} ${y ?? '0'} ${blur} ${spread} ${color}`,
				$systemProps.dynamic.shadowColor.name,
			).join(',');

			return {
				'--🍂-shadow': shadowValue,
				'box-shadow':
					'var(--🍂-ring-offset-shadow), var(--🍂-ring-shadow), var(--🍂-shadow)',
			};
		},
		{
			autocomplete: ['shadow-$shadows'],
		},
	],
];

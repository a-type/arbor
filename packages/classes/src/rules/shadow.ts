import { $systemProps } from '@arbor-css/core';
import type { Rule } from '@unocss/core';
import { colorableShadows } from '@unocss/preset-mini/utils';
import { $classesProps } from '../properties.js';
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
					[$classesProps.shadow.shadow.name]: colorableShadows(
						asLiteral,
						$systemProps.dynamic.shadowColor.name,
					).join(','),
					'box-shadow': `${$classesProps.ring.offsetShadow.var}, ${$classesProps.ring.shadow.var}, ${$classesProps.shadow.shadow.var}`,
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
				`${$classesProps.shadow.inset.var} calc(${x ?? '0'} * ${$systemProps.dynamic.shadowReverse.var}) calc(${y ?? '0'} * ${$systemProps.dynamic.shadowReverse.var}) ${blur} ${spread} ${color}`,
				$systemProps.dynamic.shadowColor.name,
			).join(',');

			return {
				[$classesProps.shadow.shadow.name]: shadowValue,
				'box-shadow': `${$classesProps.ring.offsetShadow.var}, ${$classesProps.ring.shadow.var}, ${$classesProps.shadow.shadow.var}`,
			};
		},
		{
			autocomplete: ['shadow-$shadows'],
		},
	],
	// reverse shadow direction
	[
		/^shadow-reverse$/,
		() => ({
			[$systemProps.dynamic.shadowReverse.name]: '-1',
		}),
	],
	[
		/^shadow-reverse-off$/,
		() => ({
			[$systemProps.dynamic.shadowReverse.name]: '1',
		}),
	],
	[
		/^shadow-none$/,
		() => ({
			[$classesProps.shadow.shadow.name]: '0 0 rgb(0 0 0 / 0)',
		}),
	],
	// text shadow sizes
	[
		/^text-shadow(?:-(.+))?$/,
		([, size], { theme }) => {
			const asLiteral = h.bracket(size);
			if (asLiteral) {
				return {
					'text-shadow': asLiteral,
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
			const color = getFromTheme(size, theme, {
				startFrom: 'shadow-color',
				trySuffixes: ['color'],
			});

			if (!(x && y && blur && color)) {
				return;
			}

			return {
				'text-shadow': `${x} ${y} ${blur} ${color}`,
			};
		},
		{
			autocomplete: ['text-shadow-$shadows'],
		},
	],
];

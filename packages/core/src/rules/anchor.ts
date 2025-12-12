import { Theme } from '@unocss/preset-mini';
import { Rule } from 'unocss';

const sides = ['top', 'bottom', 'left', 'right'];

export const anchorRules: Rule[] = [
	[
		/^@anchor$/,
		() => ({
			'anchor-name': 'attr(data-anchor type(<custom-ident>))',
		}),
		{ autocomplete: 'anchor' },
	],
	[
		/^@anchor-(.+)$/,
		([, name]) => ({
			'anchor-name': `--${name}`,
		}),
		{ autocomplete: 'anchor-<name>' },
	],
	[
		/^anchor-to$/,
		() => ({
			'position-anchor': 'attr(data-anchor-to type(<custom-ident>))',
		}),
		{ autocomplete: 'anchor-to' },
	],
	[
		/^anchor-to-(.+)$/,
		([, name]) => ({
			'position-anchor': `--${name}`,
		}),
		{ autocomplete: 'anchor-to-<name>' },
	],

	...sides.map(
		(pos): Rule<Theme> => [
			new RegExp(`^${pos}-anchor-(${sides.join('|')})$`),
			([, v]) => {
				return {
					[pos]: `anchor(${v})`,
				};
			},
		],
	),
];

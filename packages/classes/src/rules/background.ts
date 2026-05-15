import type { Rule, RuleContext } from '@unocss/core';
import {
	globalKeywords,
	h,
	makeGlobalStaticRules,
	positionMap,
} from '@unocss/preset-mini/utils';
import { Theme } from '../theme/types.js';
import { themeOrLiteral } from '../util/themeOrLiteral.js';

function bgGradientColorResolver() {
	return ([, mode, body]: string[], { theme }: RuleContext<Theme>) => {
		const [match] = themeOrLiteral(body, theme, {
			startFrom: 'color',
			type: 'color',
		});

		if (!match) return;

		switch (mode) {
			case 'from':
				return {
					'--🤵-gradient-from-position': '0%',
					'--🤵-gradient-from': `${match} var(--🤵-gradient-from-position)`,
					'--🤵-gradient-to-position': '100%',
					'--🤵-gradient-to': `oklch(from ${match} l c h / 0) var(--🤵-gradient-to-position)`,
					'--🤵-gradient-stops':
						'var(--🤵-gradient-from), var(--🤵-gradient-to)',
				};
			case 'via':
				return {
					'--🤵-gradient-via-position': '50%',
					'--🤵-gradient-to': `oklch(from ${match} l c h / 0)`,
					'--🤵-gradient-stops': `var(--🤵-gradient-from), ${match} var(--🤵-gradient-via-position), var(--🤵-gradient-to)`,
				};
			case 'to':
				return {
					'--🤵-gradient-to-position': '100%',
					'--🤵-gradient-to': `${match} var(--🤵-gradient-to-position)`,
				};
		}
	};
}

function bgGradientPositionResolver() {
	return ([, mode, body]: string[]) => {
		return {
			[`--🤵-gradient-${mode}-position`]: `${Number(h.bracket.cssvar.percent(body)) * 100}%`,
		};
	};
}

export const backgroundStyles: Rule<any>[] = [
	// gradients
	[
		/^bg-gradient-(.+)$/,
		([, d]) => ({ '--🤵-gradient': h.bracket(d) }),
		{
			autocomplete: [
				'bg-gradient',
				'bg-gradient-(from|to|via)',
				'bg-gradient-(from|to|via)-$colors',
				'bg-gradient-(from|to|via)-(op|opacity)',
				'bg-gradient-(from|to|via)-(op|opacity)-<percent>',
			],
		},
	],
	[
		/^(?:bg-gradient-)?stops-(\[.+\])$/,
		([, s]) => ({ '--🤵-gradient-stops': h.bracket(s) }),
	],
	[/^(?:bg-gradient-)?(from)-(.+)$/, bgGradientColorResolver()],
	[/^(?:bg-gradient-)?(via)-(.+)$/, bgGradientColorResolver()],
	[/^(?:bg-gradient-)?(to)-(.+)$/, bgGradientColorResolver()],
	[
		/^(?:bg-gradient-)?(from|via|to)-op(?:acity)?-?(.+)$/,
		([, position, opacity]) => ({
			[`--🤵-${position}-opacity`]: h.bracket.percent(opacity),
		}),
	],
	[/^(from|via|to)-([\d.]+)%$/, bgGradientPositionResolver()],
	// images
	[
		/^bg-gradient-((?:repeating-)?(?:linear|radial|conic))$/,
		([, s]) => ({
			'background-image': `${s}-gradient(var(--🤵-gradient, var(--🤵-gradient-stops, rgb(255 255 255 / 0))))`,
		}),
		{
			autocomplete: [
				'bg-gradient-repeating',
				'bg-gradient-(linear|radial|conic)',
				'bg-gradient-repeating-(linear|radial|conic)',
			],
		},
	],
	// ignore any center position
	[
		/^bg-gradient-to-([rltb]{1,2})$/,
		([, d]) => {
			if (d in positionMap) {
				return {
					'--🤵-gradient-shape': `to ${positionMap[d]} in oklch`,
					'--🤵-gradient': 'var(--🤵-gradient-shape), var(--🤵-gradient-stops)',
					'background-image': 'linear-gradient(var(--🤵-gradient))',
				};
			}
		},
		{
			autocomplete: `bg-gradient-to-(${Object.keys(positionMap)
				.filter(
					(k) =>
						k.length <= 2 && Array.from(k).every((c) => 'rltb'.includes(c)),
				)
				.join('|')})`,
		},
	],
	[
		/^(?:bg-gradient-)?shape-(.+)$/,
		([, d]) => {
			const v = d in positionMap ? `to ${positionMap[d]}` : h.bracket(d);
			if (v != null) {
				return {
					'--🤵-gradient-shape': `${v} in oklch`,
					'--🤵-gradient': 'var(--🤵-gradient-shape), var(--🤵-gradient-stops)',
				};
			}
		},
		{
			autocomplete: [
				'bg-gradient-shape',
				`bg-gradient-shape-(${Object.keys(positionMap).join('|')})`,
				`shape-(${Object.keys(positionMap).join('|')})`,
			],
		},
	],
	['bg-none', { 'background-image': 'none' }],

	['box-decoration-slice', { 'box-decoration-break': 'slice' }],
	['box-decoration-clone', { 'box-decoration-break': 'clone' }],
	...makeGlobalStaticRules('box-decoration', 'box-decoration-break'),

	// size
	['bg-auto', { 'background-size': 'auto' }],
	['bg-cover', { 'background-size': 'cover' }],
	['bg-contain', { 'background-size': 'contain' }],

	// attachments
	['bg-fixed', { 'background-attachment': 'fixed' }],
	['bg-local', { 'background-attachment': 'local' }],
	['bg-scroll', { 'background-attachment': 'scroll' }],

	// clips
	[
		'bg-clip-border',
		{
			'-webkit-background-clip': 'border-box',
			'background-clip': 'border-box',
		},
	],
	[
		'bg-clip-content',
		{
			'-webkit-background-clip': 'content-box',
			'background-clip': 'content-box',
		},
	],
	[
		'bg-clip-padding',
		{
			'-webkit-background-clip': 'padding-box',
			'background-clip': 'padding-box',
		},
	],
	[
		'bg-clip-text',
		{ '-webkit-background-clip': 'text', 'background-clip': 'text' },
	],
	...globalKeywords.map(
		(keyword) =>
			[
				`bg-clip-${keyword}`,
				{
					'-webkit-background-clip': keyword,
					'background-clip': keyword,
				},
			] as Rule,
	),

	// positions
	// skip 1 & 2 letters shortcut
	[/^bg-([-\w]{3,})$/, ([, s]) => ({ 'background-position': positionMap[s] })],

	// repeats
	['bg-repeat', { 'background-repeat': 'repeat' }],
	['bg-no-repeat', { 'background-repeat': 'no-repeat' }],
	['bg-repeat-x', { 'background-repeat': 'repeat-x' }],
	['bg-repeat-y', { 'background-repeat': 'repeat-y' }],
	['bg-repeat-round', { 'background-repeat': 'round' }],
	['bg-repeat-space', { 'background-repeat': 'space' }],
	...makeGlobalStaticRules('bg-repeat', 'background-repeat'),

	// origins
	['bg-origin-border', { 'background-origin': 'border-box' }],
	['bg-origin-padding', { 'background-origin': 'padding-box' }],
	['bg-origin-content', { 'background-origin': 'content-box' }],
	...makeGlobalStaticRules('bg-origin', 'background-origin'),
];

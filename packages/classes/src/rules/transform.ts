import type { CSSValues, Rule, RuleContext } from '@unocss/core';
import { makeGlobalStaticRules, positionMap } from '@unocss/preset-mini/utils';
import { $classesProps } from '../properties.js';
import { Theme } from '../theme/types.js';
import { h } from '../util/h.js';

const transformValues = ['translate', 'rotate', 'scale'];

const transformCpu = [
	`translateX(${$classesProps.transform.translateX.var})`,
	`translateY(${$classesProps.transform.translateY.var})`,
	`rotate(${$classesProps.transform.rotate.var})`,
	`rotateZ(${$classesProps.transform.rotateZ.var})`,
	`skewX(${$classesProps.transform.skewX.var})`,
	`skewY(${$classesProps.transform.skewY.var})`,
	`scaleX(${$classesProps.transform.scaleX.var})`,
	`scaleY(${$classesProps.transform.scaleY.var})`,
].join(' ');

const transform = [
	`translateX(${$classesProps.transform.translateX.var})`,
	`translateY(${$classesProps.transform.translateY.var})`,
	`translateZ(${$classesProps.transform.translateZ.var})`,
	`rotate(${$classesProps.transform.rotate.var})`,
	`rotateX(${$classesProps.transform.rotateX.var})`,
	`rotateY(${$classesProps.transform.rotateY.var})`,
	`rotateZ(${$classesProps.transform.rotateZ.var})`,
	`skewX(${$classesProps.transform.skewX.var})`,
	`skewY(${$classesProps.transform.skewY.var})`,
	`scaleX(${$classesProps.transform.scaleX.var})`,
	`scaleY(${$classesProps.transform.scaleY.var})`,
	`scaleZ(${$classesProps.transform.scaleZ.var})`,
].join(' ');

const transformGpu = [
	`translate3d(${$classesProps.transform.translateX.var}, ${$classesProps.transform.translateY.var}, ${$classesProps.transform.translateZ.var})`,
	`rotate(${$classesProps.transform.rotate.var})`,
	`rotateX(${$classesProps.transform.rotateX.var})`,
	`rotateY(${$classesProps.transform.rotateY.var})`,
	`rotateZ(${$classesProps.transform.rotateZ.var})`,
	`skewX(${$classesProps.transform.skewX.var})`,
	`skewY(${$classesProps.transform.skewY.var})`,
	`scaleX(${$classesProps.transform.scaleX.var})`,
	`scaleY(${$classesProps.transform.scaleY.var})`,
	`scaleZ(${$classesProps.transform.scaleZ.var})`,
].join(' ');

export const transformBase = {
	// transform
	[$classesProps.transform.rotate.name]: '0deg',
	[$classesProps.transform.rotateX.name]: '0deg',
	[$classesProps.transform.rotateY.name]: '0deg',
	[$classesProps.transform.rotateZ.name]: '0deg',
	[$classesProps.transform.scaleX.name]: '1',
	[$classesProps.transform.scaleY.name]: '1',
	[$classesProps.transform.scaleZ.name]: '1',
	[$classesProps.transform.skewX.name]: '0deg',
	[$classesProps.transform.skewY.name]: '0deg',
	[$classesProps.transform.translateX.name]: '0',
	[$classesProps.transform.translateY.name]: '0',
	[$classesProps.transform.translateZ.name]: '0',
};
const preflightKeys = Object.keys(transformBase);

export const transforms: Rule<Theme>[] = [
	// origins
	[
		/^(?:transform-)?origin-(.+)$/,
		([, s]) => ({ 'transform-origin': positionMap[s] ?? h.bracket.cssvar(s) }),
		{
			autocomplete: [
				`transform-origin-(${Object.keys(positionMap).join('|')})`,
				`origin-(${Object.keys(positionMap).join('|')})`,
			],
		},
	],

	// perspectives
	[
		/^(transform-)?perspect(?:ive)?-(.+)$/,
		([, t, s]) => {
			const v = h.bracket.cssvar.px.numberWithUnit(s);
			if (v != null) {
				if (t) {
					return {
						[$classesProps.transform.perspective.name]: `perspective(${v})`,
						transform: `${$classesProps.transform.perspective.var} ${transform}`,
					};
				}

				return {
					'-webkit-perspective': v,
					perspective: v,
				};
			}
		},
	],

	// skip 1 & 2 letters shortcut
	[
		/^perspect(?:ive)?-origin-(.+)$/,
		([, s]) => {
			const v =
				h.bracket.cssvar(s) ?? (s.length >= 3 ? positionMap[s] : undefined);
			if (v != null) {
				return {
					'-webkit-perspective-origin': v,
					'perspective-origin': v,
				};
			}
		},
	],

	// modifiers
	[
		/^(?:transform-)?translate-()(.+)$/,
		handleTranslate,
		{ custom: { preflightKeys } },
	],
	[
		/^(?:transform-)?translate-([xyz])-(.+)$/,
		handleTranslate,
		{ custom: { preflightKeys } },
	],
	[
		/^(?:transform-)?rotate-()(.+)$/,
		handleRotate,
		{ custom: { preflightKeys } },
	],
	[
		/^(?:transform-)?rotate-([xyz])-(.+)$/,
		handleRotate,
		{ custom: { preflightKeys } },
	],
	[/^(?:transform-)?skew-()(.+)$/, handleSkew, { custom: { preflightKeys } }],
	[
		/^(?:transform-)?skew-([xy])-(.+)$/,
		handleSkew,
		{
			custom: { preflightKeys },
			autocomplete: ['transform-skew-(x|y)-<percent>', 'skew-(x|y)-<percent>'],
		},
	],
	[/^(?:transform-)?scale-()(.+)$/, handleScale, { custom: { preflightKeys } }],
	[
		/^(?:transform-)?scale-([xyz])-(.+)$/,
		handleScale,
		{
			custom: { preflightKeys },
			autocomplete: [
				`transform-(${transformValues.join('|')})-<percent>`,
				`transform-(${transformValues.join('|')})-(x|y|z)-<percent>`,
				`(${transformValues.join('|')})-<percent>`,
				`(${transformValues.join('|')})-(x|y|z)-<percent>`,
			],
		},
	],

	// style
	[
		/^(?:transform-)?preserve-3d$/,
		() => ({ 'transform-style': 'preserve-3d' }),
	],
	[/^(?:transform-)?preserve-flat$/, () => ({ 'transform-style': 'flat' })],

	// base
	['transform', { transform }, { custom: { preflightKeys } }],
	[
		'transform-cpu',
		{ transform: transformCpu },
		{
			custom: {
				preflightKeys: [
					$classesProps.transform.translateX.name,
					$classesProps.transform.translateY.name,
					$classesProps.transform.rotate.name,
					$classesProps.transform.rotateZ.name,
					$classesProps.transform.skewX.name,
					$classesProps.transform.skewY.name,
					$classesProps.transform.scaleX.name,
					$classesProps.transform.scaleY.name,
				],
			},
		},
	],
	['transform-gpu', { transform: transformGpu }, { custom: { preflightKeys } }],
	['transform-none', { transform: 'none' }],
	...makeGlobalStaticRules('transform'),
];

function handleTranslate(
	[, d, b]: string[],
	{ theme }: RuleContext<Theme>,
): CSSValues | undefined {
	const v = theme.spacing?.[b] ?? h.bracket.cssvar.fraction.rem(b);
	if (v != null) {
		return {
			...axisValues(d, v, 'translate'),
			transform,
		};
	}
}

function handleScale([, d, b]: string[]): CSSValues | undefined {
	const v = h.bracket.cssvar.fraction.percent(b);
	if (v != null) {
		return {
			...axisValues(d, v, 'scale'),
			transform,
		};
	}
}

function handleRotate([, d = '', b]: string[]): CSSValues | undefined {
	const v = h.bracket.cssvar.degree(b);
	if (v != null) {
		if (d) {
			return {
				[$classesProps.transform.rotate.name]: '0deg',
				[axisToken('rotate', d).name]: v,
				transform,
			};
		} else {
			return {
				[$classesProps.transform.rotateX.name]: '0deg',
				[$classesProps.transform.rotateY.name]: '0deg',
				[$classesProps.transform.rotateZ.name]: '0deg',
				[$classesProps.transform.rotate.name]: v,
				transform,
			};
		}
	}
}

function handleSkew([, d, b]: string[]): CSSValues | undefined {
	const v = h.bracket.cssvar.degree(b);
	if (v != null) {
		return {
			...axisValues(d, v, 'skew'),
			transform,
		};
	}
}

function axisToken(
	prefix: 'translate' | 'scale' | 'skew' | 'rotate',
	d: string,
) {
	if (prefix === 'translate') {
		if (d === 'x') return $classesProps.transform.translateX;
		if (d === 'y') return $classesProps.transform.translateY;
		return $classesProps.transform.translateZ;
	}
	if (prefix === 'scale') {
		if (d === 'x') return $classesProps.transform.scaleX;
		if (d === 'y') return $classesProps.transform.scaleY;
		return $classesProps.transform.scaleZ;
	}
	if (prefix === 'skew') {
		if (d === 'x') return $classesProps.transform.skewX;
		return $classesProps.transform.skewY;
	}
	if (d === 'x') return $classesProps.transform.rotateX;
	if (d === 'y') return $classesProps.transform.rotateY;
	return $classesProps.transform.rotateZ;
}

function axisValues(
	d: string,
	v: string | number,
	prefix: 'translate' | 'scale' | 'skew',
): Record<string, string | number> {
	if (d === 'x' || d === 'y' || d === 'z') {
		return {
			[axisToken(prefix, d).name]: v,
		};
	}

	return {
		[axisToken(prefix, 'x').name]: v,
		[axisToken(prefix, 'y').name]: v,
	};
}

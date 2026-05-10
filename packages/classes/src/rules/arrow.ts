import { $globalProps } from '@arbor-css/globals';
import { $systemProps } from '@arbor-css/preset';
import { Rule } from 'unocss';

export const arrowRules: Rule[] = [
	[
		/^arrow$/,
		function* (_, ctx) {
			yield {
				fill: $systemProps.bg.applied.varFallback(
					$systemProps.scheme.trueLight.var,
				),
				stroke: $systemProps.borderColor[''].applied.var,
				width: $globalProps.arrowWidth.var,
				height: $globalProps.arrowHeight.var,
				position: 'relative',
				'z-index': 0,
			};
			yield {
				[ctx.symbols.selector]: (selector) => `${selector}[data-side="top"]`,
				transform: 'rotate(0deg)',
				bottom: `calc(-1 * ${$globalProps.arrowHeight.var} + 1px)`,
			};
			yield {
				[ctx.symbols.selector]: (selector) => `${selector}[data-side="right"]`,
				transform: 'rotate(90deg)',
				left: `calc(-1 * ${$globalProps.arrowWidth.var} * 0.75)`,
			};
			yield {
				[ctx.symbols.selector]: (selector) => `${selector}[data-side="left"]`,
				transform: 'rotate(-90deg)',
				right: `calc(-1 * ${$globalProps.arrowWidth.var} * 0.75)`,
			};
			yield {
				[ctx.symbols.selector]: (selector) => `${selector}[data-side="bottom"]`,
				transform: 'rotate(180deg)',
				top: `calc(-1 * ${$globalProps.arrowHeight.var})`,
			};
		},
	],
];

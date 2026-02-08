import { Theme } from '@unocss/preset-mini';
import { Rule } from 'unocss';
import { CALCS } from '../constants/calcs';
import { PROPS } from '../constants/properties';
import { groupRule } from './_util';

export const nestRules: Rule<Theme>[] = [
	[
		/^nest-(p|m|rd|gap|all)(\/(:?p|m|rd|gap|all))*$/,
		function* (match, ctx) {
			const types = [match[1], ...(match[2]?.split('/').slice(1) ?? [])];

			for (const type of types) {
				if (type === 'p' || type === 'all') {
					yield* groupRule(
						'PADDING',
						'padding',
						(vals) =>
							`calc(${CALCS.GROUP.SCALE(1 / 2)}*var(${
								vals.PADDING.LOCAL
							},0px))`,
						ctx,
						false,
					);
				}
				if (type === 'm' || type === 'all') {
					yield* groupRule(
						'MARGIN',
						'margin',
						(vals) =>
							`calc(${CALCS.GROUP.SCALE(1 / 2)}*var(${vals.MARGIN.LOCAL},0px))`,
						ctx,
						false,
					);
				}
				if (type === 'gap' || type === 'all') {
					yield* groupRule(
						'GAP',
						'gap',
						(vals) =>
							`calc(${CALCS.GROUP.SCALE(1 / 2)}*var(${vals.GAP.LOCAL},0px))`,
						ctx,
						false,
					);
				}
				if (type === 'rd' || type === 'all') {
					yield* groupRule(
						'RADIUS',
						{
							all: 'border-radius',
							even: PROPS.GROUP.ODD.RADIUS.PARENT,
							odd: PROPS.GROUP.EVEN.RADIUS.PARENT,
							initial: PROPS.GROUP.ODD.RADIUS.PARENT,
						},
						(vals, opposites) =>
							CALCS.IF(
								[
									{
										if: vals.RADIUS.PARENT,
										is: '0px',
										value: `var(${vals.RADIUS.LOCAL},0px)`,
									},
								],
								`calc(var(${opposites.RADIUS.FINAL},0px) - var(${opposites.PADDING.FINAL},0px))`,
							),
						ctx,
						false,
					);
				}
			}
		},
		{
			autocomplete: 'nest-(p|m|rd|gap|all)(/(p|m|rd|gap|all))*',
		},
	],
];

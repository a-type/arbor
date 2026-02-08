import { Rule } from 'unocss';
import { CONTAINERS } from '../constants/containers';
import { PROPS } from '../constants/properties';
import { SELECTORS } from '../constants/selectors';
import { VALUES } from '../constants/values';

export const groupRules: Rule[] = [
	[
		/^@group$/,
		function* (_, { symbols }) {
			yield {
				[symbols.parent]: SELECTORS.GROUP_INITIAL,
				[PROPS.GROUP.DEPTH]: '0',
				[PROPS.GROUP.EVEN.DEPTH]: '0',
				[PROPS.GROUP.ODD.DEPTH]: '0',
				[PROPS.GROUP.EVEN_ODD]: VALUES.GROUP.EVEN,
			};
			yield {
				[symbols.parent]: SELECTORS.GROUP_EVEN,
				[PROPS.GROUP.EVEN_ODD]: VALUES.GROUP.EVEN,
				[PROPS.GROUP.EVEN.DEPTH]: `calc(var(${PROPS.GROUP.ODD.DEPTH}) + 1)`,
				[PROPS.GROUP.DEPTH]: `var(${PROPS.GROUP.EVEN.DEPTH})`,
			};
			yield {
				[symbols.parent]: SELECTORS.GROUP_ODD,
				[PROPS.GROUP.EVEN_ODD]: VALUES.GROUP.ODD,
				[PROPS.GROUP.ODD.DEPTH]: `calc(var(${PROPS.GROUP.EVEN.DEPTH}) + 1)`,
				[PROPS.GROUP.DEPTH]: `var(${PROPS.GROUP.ODD.DEPTH})`,
			};
			yield {
				contain: `style`,
				'container-name': CONTAINERS.GROUP,
			};
		},
	],
	[
		/^@group-reset$/,
		function* (_, { symbols }) {
			yield {
				contain: 'style',
				'container-name': CONTAINERS.GROUP,
				[PROPS.GROUP.DEPTH]: '0',
				[PROPS.GROUP.EVEN_ODD]: VALUES.GROUP.INITIAL,
				...[PROPS.GROUP.EVEN, PROPS.GROUP.ODD].reduce(
					(acc, prop) => {
						Object.values(prop).forEach((subProp) => {
							if (typeof subProp === 'string') {
								acc[subProp] = 'initial';
							} else {
								Object.values(subProp).forEach((subProp2) => {
									acc[subProp2] = 'initial';
								});
							}
						});
						return acc;
					},
					{} as Record<string, string>,
				),
			};
		},
	],
];

import { Rule } from 'unocss';
import { CONTAINERS } from '../constants/containers';
import { PROPS } from '../constants/properties';
import { SELECTORS } from '../constants/selectors';

export const groupRules: Rule[] = [
	[
		/^group$/,
		function* (_, { symbols }) {
			yield {
				[symbols.parent]: SELECTORS.GROUP_INITIAL,
				[PROPS.GROUP.DEPTH]: '0',
				[PROPS.GROUP.DEPTH_EVEN]: '0',
				[PROPS.GROUP.DEPTH_ODD]: '0',
				[PROPS.GROUP.EVEN_ODD]: '0',
			};
			yield {
				[symbols.parent]: SELECTORS.GROUP_EVEN,
				[PROPS.GROUP.EVEN_ODD]: '0',
				[PROPS.GROUP.DEPTH_EVEN]: `calc(var(${PROPS.GROUP.DEPTH_ODD}) + 1)`,
				[PROPS.GROUP.DEPTH]: `var(${PROPS.GROUP.DEPTH_EVEN})`,
			};
			yield {
				[symbols.parent]: SELECTORS.GROUP_ODD,
				[PROPS.GROUP.EVEN_ODD]: '1',
				[PROPS.GROUP.DEPTH_ODD]: `calc(var(${PROPS.GROUP.DEPTH_EVEN}) + 1)`,
				[PROPS.GROUP.DEPTH]: `var(${PROPS.GROUP.DEPTH_ODD})`,
			};
			yield {
				contain: `style`,
				'container-name': CONTAINERS.GROUP,
			};
		},
	],
	[
		/^group-reset$/,
		() => ({
			[PROPS.GROUP.DEPTH]: '0',
			[PROPS.GROUP.DEPTH_EVEN]: '0',
			[PROPS.GROUP.DEPTH_ODD]: '0',
		}),
	],
];

import { PROPS } from './properties';

export const CALCS = {
	GROUP: {
		SCALE: (mult = 1 / 2, pow = 1) =>
			`calc(pow(${mult}, pow(var(${PROPS.GROUP.DEPTH}, 1), ${pow})))`,
		NESTED_RADIUS: (mode: 'ODD' | 'EVEN') =>
			`calc(var(${PROPS.GROUP.RADIUS[mode]}, 0px) - ((var(${PROPS.GROUP.PADDING[mode]}, 0px) + var(${PROPS.GROUP.MARGIN[mode]}, 0px)) / 1.5))`,
	},
};

import { PROPS } from './properties';

export const CALCS = {
	GROUP: {
		SCALE: (mult = 1 / 2, pow = 1) =>
			`(pow(${mult}, pow(var(${PROPS.GROUP.DEPTH}, 1), ${pow})))`,
	},
};

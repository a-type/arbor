import { PROPS } from './properties';

export const CALCS = {
	GROUP: {
		SCALE: (mult = 1 / 2, pow = 1) =>
			`calc(pow(${mult}, pow(var(${PROPS.GROUP.DEPTH}, 0), ${pow})))`,
		NESTED_RADIUS: (mode: 'ODD' | 'EVEN') =>
			`calc(
				var(${PROPS.GROUP.RADIUS[mode]}, 0px)
				- (
						(var(${PROPS.GROUP.PADDING[mode]}, 0px)
						+ var(${PROPS.GROUP.MARGIN[mode]}, 0px)
					) / 1.5)
				)`,
		EVEN_ODD: (even: string, odd: string, none?: string) => {
			if (none !== undefined) {
				return `if (
					style(${PROPS.GROUP.EVEN_ODD}: -1): ${none};
					style(${PROPS.GROUP.EVEN_ODD}: 0): ${even};
					else: ${odd}
				)`;
			}
			return `if (style(${PROPS.GROUP.EVEN_ODD}: 0): ${even}; else: ${odd})`;
		},
	},
};

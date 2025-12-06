import { PROPS } from '../constants/properties.js';
import { preflight } from './_util.js';

const lightModeCSS = `
${PROPS.MODE.MULT}: 1;
${PROPS.MODE.L_NEUTRAL}: 90%;
${PROPS.MODE.L_RANGE_UP}: 10%;
${PROPS.MODE.L_RANGE_DOWN}: 70%;
${PROPS.MODE.S_NEUTRAL}: 75%;
${PROPS.MODE.S_RANGE_UP}: -55%;
${PROPS.MODE.S_RANGE_DOWN}: 20%;
${PROPS.MODE.WHITE}: #ffffff;
${PROPS.MODE.BLACK}: #000000;
`;

const darkModeCSS = `
${PROPS.MODE.MULT}: -1;
${PROPS.MODE.L_NEUTRAL}: 60%;
${PROPS.MODE.L_RANGE_UP}: 38%;
${PROPS.MODE.L_RANGE_DOWN}: 70%;
${PROPS.MODE.S_NEUTRAL}: 80%;
${PROPS.MODE.S_RANGE_UP}: 40%;
${PROPS.MODE.S_RANGE_DOWN}: -30%;
${PROPS.MODE.WHITE}: #000000;
${PROPS.MODE.BLACK}: #ffffff;
`;

export const modePreflight = preflight({
	getCSS: () => `
@layer preflightBase {
	html {
		${lightModeCSS}
	}

	@media (prefers-color-scheme: dark) {
		html {
			${darkModeCSS}
		}
	}
}

@layer preflightVariants {
	.override-light {
		${lightModeCSS}
	}
	.override-dark {
		${darkModeCSS}
	}
}`,
});

import { PROPS } from '../constants/properties.js';
import {
	defaultPalettes,
	graySaturation,
	highContrastSaturation,
} from '../logic/palettes.js';
import { preflight } from './_util.js';
import { UserPreflightOptions } from './user.js';

export interface ColorPreflightOptions {
	namedHues?: UserPreflightOptions['namedHues'];
}

export const colorPreflight = (options: ColorPreflightOptions) =>
	preflight({
		getCSS: () => `
.palette-primary {
	${PROPS.PALETTE.MAIN_HUE}: var(${PROPS.USER.COLOR.PRIMARY_HUE});
	${PROPS.PALETTE.SATURATION}: 1;
}

${
	options.namedHues
		? Object.keys(options.namedHues)
				// User-provided named hues
				.map(
					(name) => `
.palette-${name} {
	${PROPS.PALETTE.MAIN_HUE}: var(${PROPS.USER.COLOR.NAMED_HUE(name)});
	${PROPS.PALETTE.SATURATION}: 1;
}
`,
				)
				.join('\n')
		: ''
}

${/* useful to reset from gray, I guess? */ ''}
.palette-main {
	${PROPS.PALETTE.SATURATION}: 1;
}

.palette-gray {
	${PROPS.PALETTE.SATURATION}: ${graySaturation};
}

.palette-high-contrast {
	${PROPS.PALETTE.SATURATION}: ${highContrastSaturation};
	${PROPS.PALETTE.LIGHTNESS_SPREAD}: 10;
}

body {
	${PROPS.COLOR.INHERITED}: ${defaultPalettes['high-contrast'].styles.ink};
	color: var(${PROPS.COLOR.INHERITED});
	${PROPS.BACKGROUND_COLOR.INHERITED}: ${defaultPalettes['gray'].styles.wash};
	background-color: var(${PROPS.BACKGROUND_COLOR.INHERITED});
	${PROPS.PALETTE.MAIN_HUE}: var(${PROPS.USER.COLOR.PRIMARY_HUE});
}

${[
	PROPS.COLOR,
	PROPS.BACKGROUND_COLOR,
	PROPS.BORDER_COLOR.ALL,
	PROPS.BORDER_COLOR.TOP,
	PROPS.BORDER_COLOR.RIGHT,
	PROPS.BORDER_COLOR.BOTTOM,
	PROPS.BORDER_COLOR.LEFT,
	PROPS.RING_COLOR,
]
	.map((propGroup) => propertyDefinitions(propGroup))
	.join('\n')}
`,
	});

function propertyDefinitions(propGroup: {
	INHERITED: string;
	FINAL: string;
	OPACITY: string;
}) {
	return `@property ${propGroup.FINAL} { syntax: "*"; inherits: false; }
@property ${propGroup.INHERITED} { syntax: "*"; inherits: true; }
@property ${propGroup.OPACITY} { syntax: "<percentage>"; inherits: false; }
`;
}

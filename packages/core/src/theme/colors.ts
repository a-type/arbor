import { Theme } from '@unocss/preset-mini';
import { ThemeOptions } from '.';
import { PROPS } from '../constants/properties';
import { createColorLogicalPalette, defaultPalettes } from '../logic/palettes';

const contrastClamp = 'clamp(0, (0.36 / y - 1) * infinity, 1)';

export function makeThemeColors(options: ThemeOptions): Theme['colors'] {
	return {
		none: 'transparent',
		transparent: 'transparent',
		current: 'currentColor',

		black: defaultPalettes['high-contrast'].styles.ink,
		white: defaultPalettes['high-contrast'].styles.wash,
		wash: defaultPalettes.gray.styles.wash,

		// magic token that provides a high-contrast color based on background
		contrast: `color(from var(${PROPS.BACKGROUND_COLOR.CONTRAST},var(${PROPS.BACKGROUND_COLOR.FINAL},var(${PROPS.BACKGROUND_COLOR.INHERITED},var(${PROPS.MODE.WHITE})))) xyz-d65 ${contrastClamp} ${contrastClamp} ${contrastClamp})`,
		// magic tokens which read their value from another property
		bg: `var(${PROPS.BACKGROUND_COLOR.FINAL}, var(${PROPS.BACKGROUND_COLOR.INHERITED}, transparent))`,
		fg: `var(${PROPS.COLOR.FINAL}, var(${PROPS.COLOR.INHERITED}, var(${PROPS.MODE.BLACK})))`,
		color: `var(${PROPS.COLOR.FINAL}, var(${PROPS.COLOR.INHERITED}, var(${PROPS.MODE.BLACK})))`,
		border: `var(${PROPS.BORDER_COLOR.ALL.FINAL}, var(${PROPS.BORDER_COLOR.ALL.INHERITED}, transparent))`,

		primary: defaultPalettes.primary.styles,
		main: defaultPalettes.main.styles,
		gray: defaultPalettes.gray.styles,

		// user-defined colors
		...(options.namedHues
			? Object.fromEntries(
					Object.entries(options.namedHues).map(([name, config]) => [
						name,
						createColorLogicalPalette({
							sourceHue: PROPS.USER.COLOR.NAMED_HUE(name),
							saturation: config.saturation
								? `${config.saturation / 100}`
								: undefined,
						}),
					]),
			  )
			: {}),
	};
}

import { Theme } from '@unocss/preset-mini';
import { ThemeOptions } from '.';
import { PROPS } from '../constants/properties';

const contrastClamp = 'clamp(0, (0.36 / y - 1) * infinity, 1)';

export function makeThemeColors(options: ThemeOptions): Theme['colors'] {
	return {
		none: 'transparent',
		transparent: 'transparent',
		current: 'currentColor',

		black: PROPS.PALETTE.NAMED_SHADES('high-contrast').INK,
		white: PROPS.PALETTE.NAMED_SHADES('high-contrast').WASH,
		wash: PROPS.PALETTE.GRAY_SHADES.WASH,

		// magic token that provides a high-contrast color based on background
		contrast: `color(from var(${PROPS.BACKGROUND_COLOR.CONTRAST},var(${PROPS.BACKGROUND_COLOR.FINAL},var(${PROPS.BACKGROUND_COLOR.INHERITED},var(${PROPS.MODE.WHITE})))) xyz-d65 ${contrastClamp} ${contrastClamp} ${contrastClamp})`,
		// magic tokens which read their value from another property
		bg: `var(${PROPS.BACKGROUND_COLOR.FINAL}, var(${PROPS.BACKGROUND_COLOR.INHERITED}, transparent))`,
		fg: `var(${PROPS.COLOR.FINAL}, var(${PROPS.COLOR.INHERITED}, var(${PROPS.MODE.BLACK})))`,
		color: `var(${PROPS.COLOR.FINAL}, var(${PROPS.COLOR.INHERITED}, var(${PROPS.MODE.BLACK})))`,
		border: `var(${PROPS.BORDER_COLOR.ALL.FINAL}, var(${PROPS.BORDER_COLOR.ALL.INHERITED}, transparent))`,

		// the current palette color shades
		main: shadesOf(PROPS.PALETTE.SHADES),

		primary: shadesOf(PROPS.PALETTE.NAMED_SHADES('primary')),
		gray: shadesOf(PROPS.PALETTE.GRAY_SHADES),

		// user-defined colors
		...(options.namedHues
			? Object.fromEntries(
					Object.entries(options.namedHues).map(([name]) => [
						name,
						shadesOf(PROPS.PALETTE.NAMED_SHADES(name)),
					]),
			  )
			: {}),
	};
}

function shadesOf(entries: typeof PROPS.PALETTE.SHADES) {
	return {
		wash: `var(${entries.WASH})`,
		light: `var(${entries.LIGHT})`,
		DEFAULT: `var(${entries.MID})`,
		dark: `var(${entries.DARK})`,
		ink: `var(${entries.INK})`,
	};
}

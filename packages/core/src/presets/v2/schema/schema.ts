import { createModeSchema } from '@arbor-css/modes';
import { global } from './global.js';
import { boxIntents, textAndFontIntents, visualIntents } from './intents.js';
import {
	colorRangeSemantic,
	colorsSemantics,
	shadowSemantic,
} from './semantics.js';

export type V2SchemaConfig<TColorName extends string> = {
	colorNames: TColorName[];
};

export const modeSchema = <TColorName extends string>(
	config: V2SchemaConfig<TColorName>,
) =>
	createModeSchema({
		global,

		/* Color */
		tint: colorRangeSemantic,
		gray: colorRangeSemantic,
		color: colorsSemantics(config.colorNames),

		/* Shape */
		sp: {
			$root: 'spacing',
			xs: 'spacing',
			sm: 'spacing',
			md: 'spacing',
			lg: 'spacing',
			xl: 'spacing',
		},
		rd: {
			$root: 'border-radius',
			xs: 'border-radius',
			sm: 'border-radius',
			md: 'border-radius',
			lg: 'border-radius',
			xl: 'border-radius',
			full: 'border-radius',
		},
		lw: {
			$root: 'border-width',
			sm: 'border-width',
			md: 'border-width',
			lg: 'border-width',
		},

		/* Shadow */
		shadow: {
			$root: 'shadow',
			none: shadowSemantic,
			sm: shadowSemantic,
			md: shadowSemantic,
			lg: shadowSemantic,
			xl: shadowSemantic,
		},

		/* Text */
		fs: {
			$root: 'font-size',
			sm: 'font-size',
			md: 'font-size',
			lg: 'font-size',
		},
		fw: {
			$root: 'font-weight',
			normal: 'font-weight',
			bold: 'font-weight',
		},
		lh: {
			$root: 'line-height',
			tight: 'line-height',
			normal: 'line-height',
			loose: 'line-height',
		},
		ls: {
			$root: 'letter-spacing',
			tight: 'letter-spacing',
			normal: 'letter-spacing',
			loose: 'letter-spacing',
		},

		/* Animation */
		dur: {
			$root: 'duration',
			short: 'duration',
			medium: 'duration',
			long: 'duration',
		},
		ease: {
			$root: 'easing-function',
			tight: 'easing-function',
			medium: 'easing-function',
			loose: 'easing-function',
			in: {
				$root: 'easing-function',
				tight: 'easing-function',
				medium: 'easing-function',
				loose: 'easing-function',
			},
			out: {
				$root: 'easing-function',
				tight: 'easing-function',
				medium: 'easing-function',
				loose: 'easing-function',
			},
		},

		/* Intents */

		fg: {
			$root: 'color',
			light: 'color',
			ink: 'color',

			gray: {
				$root: 'color',
				light: 'color',
				ink: 'color',
			},
		},
		bg: {
			$root: 'color',
			paper: 'color',
			wash: 'color',
			light: 'color',
			bold: 'color',

			gray: {
				$root: 'color',
				paper: 'color',
				wash: 'color',
				light: 'color',
				bold: 'color',
			},
		},

		action: {
			p: boxIntents,
			rd: 'border-radius',
			text: textAndFontIntents,
			primary: visualIntents,
			secondary: visualIntents,
			ambient: visualIntents,

			config: {
				roundness: 'scalar',
			},
		},
		surface: {
			p: boxIntents,
			rd: 'border-radius',
			text: textAndFontIntents,
			primary: visualIntents,
			secondary: visualIntents,
			ambient: visualIntents,

			config: {
				roundness: 'scalar',
			},
		},
		control: {
			p: boxIntents,
			rd: 'border-radius',
			text: textAndFontIntents,
			...visualIntents,

			config: {
				roundness: 'scalar',
			},
		},
		prose: {
			primary: textAndFontIntents,
			secondary: textAndFontIntents,
			ambient: textAndFontIntents,
		},
	});

export type ModeSchema<TColorName extends string = string> = ReturnType<
	typeof modeSchema<TColorName>
>;

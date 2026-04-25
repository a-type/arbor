import { PROPS, createModeSchema } from '../src/index.js';

export const modeSchema = createModeSchema({
	MAIN_COLOR: {
		PAPER: 'color',
		WASH: 'color',
		LIGHTER: 'color',
		LIGHT: 'color',
		DEFAULT: 'color',
		DARK: 'color',
		DARKER: 'color',
		INK: 'color',
	},
	NEUTRAL_COLOR: {
		PAPER: 'color',
		WASH: 'color',
		LIGHTER: 'color',
		LIGHT: 'color',
		DEFAULT: 'color',
		DARK: 'color',
		DARKER: 'color',
		INK: 'color',
	},
	ACTION: {
		PRIMARY: {
			BG: 'color',
			FG: 'color',
			BORDER: 'color',
		},
		SECONDARY: {
			BG: 'color',
			FG: 'color',
			BORDER: 'color',
		},
		ANCILLARY: {
			BG: 'color',
			FG: 'color',
			BORDER: 'color',
		},
	},
	SURFACE: {
		PRIMARY: {
			BG: 'color',
			FG: 'color',
			BORDER: 'color',
		},
		SECONDARY: {
			BG: 'color',
			FG: 'color',
			BORDER: 'color',
		},
		ANCILLARY: {
			BG: 'color',
			FG: 'color',
			BORDER: 'color',
		},
	},
	CONTROL: {
		BG: 'color',
		FG: 'color',
		BORDER: 'color',
	},
	TEXT: {
		PRIMARY: {
			SIZE: 'length',
			WEIGHT: '*',
			LINE_HEIGHT: '*',
		},
		SECONDARY: {
			SIZE: 'length',
			WEIGHT: '*',
			LINE_HEIGHT: '*',
		},
		ANCILLARY: {
			SIZE: 'length',
			WEIGHT: '*',
			LINE_HEIGHT: '*',
		},
	},
	DENSITY: 'number',
});

export const rootMode = modeSchema.createBase({
	MAIN_COLOR: {
		PAPER: PROPS.COLOR('primary').PAPER.VAR,
		WASH: PROPS.COLOR('primary').WASH.VAR,
		LIGHTER: PROPS.COLOR('primary').LIGHTER.VAR,
		LIGHT: PROPS.COLOR('primary').LIGHT.VAR,
		DEFAULT: PROPS.COLOR('primary').DEFAULT.VAR,
		DARK: PROPS.COLOR('primary').DARK.VAR,
		DARKER: PROPS.COLOR('primary').DARKER.VAR,
		INK: PROPS.COLOR('primary').INK.VAR,
	},
	NEUTRAL_COLOR: {
		PAPER: PROPS.COLOR('primary').PAPER.SUFFIXED('neutral').VAR,
		WASH: PROPS.COLOR('primary').WASH.SUFFIXED('neutral').VAR,
		LIGHTER: PROPS.COLOR('primary').LIGHTER.SUFFIXED('neutral').VAR,
		LIGHT: PROPS.COLOR('primary').LIGHT.SUFFIXED('neutral').VAR,
		DEFAULT: PROPS.COLOR('primary').DEFAULT.SUFFIXED('neutral').VAR,
		DARK: PROPS.COLOR('primary').DARK.SUFFIXED('neutral').VAR,
		DARKER: PROPS.COLOR('primary').DARKER.SUFFIXED('neutral').VAR,
		INK: PROPS.COLOR('primary').INK.SUFFIXED('neutral').VAR,
	},
	SURFACE: {
		PRIMARY: {
			BG: PROPS.COLOR('primary').WASH.VAR,
			FG: PROPS.COLOR('primary').INK.VAR,
			BORDER: PROPS.COLOR('primary').DARK.VAR,
		},
		SECONDARY: {
			BG: PROPS.COLOR('primary').LIGHTER.SUFFIXED('neutral').VAR,
			FG: PROPS.COLOR('primary').DARKER.SUFFIXED('neutral').VAR,
			BORDER: PROPS.COLOR('primary').DARK.SUFFIXED('neutral').VAR,
		},
		ANCILLARY: {
			BG: PROPS.COLOR('primary').WASH.SUFFIXED('neutral').VAR,
			FG: PROPS.COLOR('primary').INK.SUFFIXED('neutral').VAR,
			BORDER: PROPS.COLOR('primary').DARK.SUFFIXED('neutral').VAR,
		},
	},
	CONTROL: {
		BG: PROPS.COLOR('primary').PAPER.SUFFIXED('neutral').VAR,
		FG: PROPS.COLOR('primary').INK.SUFFIXED('neutral').VAR,
		BORDER: PROPS.COLOR('primary').DARK.SUFFIXED('neutral').VAR,
	},
	ACTION: {
		PRIMARY: {
			BG: PROPS.COLOR('primary').DEFAULT.VAR,
			FG: PROPS.COLOR('primary').INK.VAR,
			BORDER: PROPS.COLOR('primary').DARK.VAR,
		},
		SECONDARY: {
			BG: PROPS.COLOR('primary').LIGHTER.SUFFIXED('neutral').VAR,
			FG: PROPS.COLOR('primary').DARKER.SUFFIXED('neutral').VAR,
			BORDER: PROPS.COLOR('primary').DARK.SUFFIXED('neutral').VAR,
		},
		ANCILLARY: {
			BG: PROPS.COLOR('primary').WASH.SUFFIXED('neutral').VAR,
			FG: PROPS.COLOR('primary').INK.SUFFIXED('neutral').VAR,
			BORDER: PROPS.COLOR('primary').DARK.SUFFIXED('neutral').VAR,
		},
	},
	TEXT: {
		PRIMARY: {
			SIZE: '5rem',
			WEIGHT: 'bold',
			LINE_HEIGHT: '1.5',
		},
		SECONDARY: {
			SIZE: '1rem',
			WEIGHT: 'normal',
			LINE_HEIGHT: '1.5',
		},
		ANCILLARY: {
			SIZE: '0.875rem',
			WEIGHT: 'normal',
			LINE_HEIGHT: '1.5',
		},
	},
	DENSITY: 1,
});

export const altMode = modeSchema.createPartial({
	MAIN_COLOR: {
		PAPER: PROPS.COLOR('alt').PAPER.VAR,
		WASH: PROPS.COLOR('alt').WASH.VAR,
		LIGHTER: PROPS.COLOR('alt').LIGHTER.VAR,
		LIGHT: PROPS.COLOR('alt').LIGHT.VAR,
		DEFAULT: PROPS.COLOR('alt').DEFAULT.VAR,
		DARK: PROPS.COLOR('alt').DARK.VAR,
		DARKER: PROPS.COLOR('alt').DARKER.VAR,
		INK: PROPS.COLOR('alt').INK.VAR,
	},
	NEUTRAL_COLOR: {
		PAPER: PROPS.COLOR('alt').PAPER.SUFFIXED('neutral').VAR,
		WASH: PROPS.COLOR('alt').WASH.SUFFIXED('neutral').VAR,
		LIGHTER: PROPS.COLOR('alt').LIGHTER.SUFFIXED('neutral').VAR,
		LIGHT: PROPS.COLOR('alt').LIGHT.SUFFIXED('neutral').VAR,
		DEFAULT: PROPS.COLOR('alt').DEFAULT.SUFFIXED('neutral').VAR,
		DARK: PROPS.COLOR('alt').DARK.SUFFIXED('neutral').VAR,
		DARKER: PROPS.COLOR('alt').DARKER.SUFFIXED('neutral').VAR,
		INK: PROPS.COLOR('alt').INK.SUFFIXED('neutral').VAR,
	},
	ACTION: {
		PRIMARY: {
			BG: PROPS.COLOR('alt').DEFAULT.VAR,
			FG: PROPS.COLOR('alt').INK.VAR,
			BORDER: PROPS.COLOR('alt').DARK.VAR,
		},
		SECONDARY: {
			BG: PROPS.COLOR('alt').LIGHTER.VAR,
			FG: PROPS.COLOR('alt').DARKER.VAR,
			BORDER: PROPS.COLOR('alt').DARK.VAR,
		},
		ANCILLARY: {
			BG: PROPS.COLOR('alt').WASH.VAR,
			FG: PROPS.COLOR('alt').INK.VAR,
			BORDER: PROPS.COLOR('alt').DARK.VAR,
		},
	},
	SURFACE: {
		PRIMARY: {
			BG: PROPS.COLOR('alt').WASH.VAR,
			FG: PROPS.COLOR('alt').INK.VAR,
			BORDER: PROPS.COLOR('alt').DARK.VAR,
		},
		SECONDARY: {
			BG: PROPS.COLOR('alt').LIGHTER.SUFFIXED('neutral').VAR,
			FG: PROPS.COLOR('alt').DARKER.SUFFIXED('neutral').VAR,
			BORDER: PROPS.COLOR('alt').DARK.SUFFIXED('neutral').VAR,
		},
		ANCILLARY: {
			BG: PROPS.COLOR('alt').WASH.SUFFIXED('neutral').VAR,
			FG: PROPS.COLOR('alt').INK.SUFFIXED('neutral').VAR,
			BORDER: PROPS.COLOR('alt').DARK.SUFFIXED('neutral').VAR,
		},
	},
	CONTROL: {
		BORDER: PROPS.COLOR('alt').DEFAULT.VAR,
		BG: PROPS.COLOR('alt').WASH.VAR,
	},
});

export const greenButtonsMode = modeSchema.createPartial({
	ACTION: {
		PRIMARY: {
			BG: PROPS.COLOR('green').DEFAULT.VAR,
			FG: PROPS.COLOR('green').INK.VAR,
			BORDER: PROPS.COLOR('green').DARK.VAR,
		},
		SECONDARY: {
			BG: PROPS.COLOR('green').LIGHTER.VAR,
			FG: PROPS.COLOR('green').DARKER.VAR,
			BORDER: PROPS.COLOR('green').DARK.VAR,
		},
	},
});

export const denseMode = modeSchema.createPartial({
	DENSITY: 0.5,
});

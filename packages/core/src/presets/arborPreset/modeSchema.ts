import { SimpleTokenSchema } from '@arbor-css/tokens';

const colorIntents = {
	fg: {
		purpose: 'color',
		description: 'Intended for use as the foreground color',
	},
	bg: {
		purpose: 'color',
		description: 'Intended for use as the background color',
	},
	border: {
		purpose: 'color',
		description: 'Intended for use as the border color, if desired',
	},
} satisfies SimpleTokenSchema;

const boxIntents = {
	$root: {
		purpose: 'other',
		description:
			'Combines inline and block padding, can be passed directly to "padding"',
	},
	inline: {
		purpose: 'spacing',
		description: 'Inline (horizontal, usually) padding',
	},
	block: {
		purpose: 'spacing',
		description: 'Block (vertical, usually) padding',
	},
} satisfies SimpleTokenSchema;

const textIntents = {
	size: 'font-size',
	weight: 'font-weight',
	lineHeight: 'line-height',
	font: 'font-family',
} satisfies SimpleTokenSchema;

const shadowIntents = {
	x: {
		purpose: 'size',
		description: 'Horizontal offset of the shadow',
	},
	y: {
		purpose: 'size',
		description: 'Vertical offset of the shadow',
	},
	blur: {
		purpose: 'size',
		description: 'Blur radius of the shadow',
	},
	spread: {
		purpose: 'size',
		description: 'Spread radius of the shadow',
	},
	color: {
		purpose: 'color',
		description: 'Color of the shadow',
	},
	$root: {
		purpose: 'shadow',
		description: 'Full shadow value, can be passed to "box-shadow"',
	},
} satisfies SimpleTokenSchema;

export const arborModeSchema = {
	color: {
		main: {
			$root: {
				purpose: 'color',
				description: 'A convenient reference for the "mid" shade',
			},
			paper: {
				purpose: 'color',
				description: 'A very light shade, good for backgrounds and surfaces',
			},
			wash: {
				purpose: 'color',
				description:
					'A very faint but colorful shade, good for backgrounds and surfaces',
			},
			light: {
				purpose: 'color',
				description:
					"A light shade of the mode's main color, good for emphasized surfaces.",
			},
			mid: {
				purpose: 'color',
				description:
					"The main shade of the mode's main color, good for primary actions and decoration.",
			},
			heavy: {
				purpose: 'color',
				description:
					"A heavy shade of the mode's main color, good for text emphasis and accents.",
			},
			ink: {
				purpose: 'color',
				description:
					"A very dark but still colorful shade of the mode's main color, good for text and high contrast elements.",
			},
		},
		neutral: {
			$root: {
				purpose: 'color',
				description: 'A convenient reference for the "mid" neutral shade',
			},
			paper: {
				purpose: 'color',
				description:
					'A very light neutral shade, good for backgrounds and surfaces',
			},
			wash: {
				purpose: 'color',
				description: 'A faint neutral shade, good for backgrounds and surfaces',
			},
			light: {
				purpose: 'color',
				description: 'A light neutral shade, good for emphasized surfaces',
			},
			mid: {
				purpose: 'color',
				description:
					'The main neutral shade, good for primary actions and decoration',
			},
			heavy: {
				purpose: 'color',
				description:
					'A heavy neutral shade, good for low-emphasis text and accents',
			},
			ink: {
				purpose: 'color',
				description:
					'A very dark neutral shade, good for text and high contrast elements',
			},
		},
	},

	// intents
	action: {
		padding: boxIntents,
		roundness: {
			purpose: 'scalar',
			description:
				'This token controls the overall roundness of actions and stacks with the root roundness token',
		},
		radius: {
			purpose: 'border-radius',
			description:
				'This token captures the border-radius of actions, taking into account the overall roundness',
		},
		primary: colorIntents,
		secondary: colorIntents,
		ambient: colorIntents,
	},
	control: {
		padding: boxIntents,
		roundness: {
			purpose: 'scalar',
			description:
				'This token controls the overall roundness of controls and stacks with the root roundness token',
		},
		radius: {
			purpose: 'border-radius',
			description:
				'This token captures the border-radius of controls, taking into account the overall roundness',
		},
		...colorIntents,
	},
	surface: {
		padding: boxIntents,
		roundness: {
			purpose: 'scalar',
			description:
				'This token controls the overall roundness of surfaces and stacks with the root roundness token',
		},
		radius: {
			purpose: 'border-radius',
			description:
				'This token captures the border-radius of surfaces, taking into account the overall roundness',
		},
		primary: colorIntents,
		secondary: colorIntents,
		ambient: colorIntents,
	},
	text: {
		primary: textIntents,
		secondary: textIntents,
		ambient: textIntents,
	},

	// density
	density: {
		purpose: 'scalar',
		description:
			'A scaling factor for density. Higher density means smaller, tighter spacing and size',
	},
	spacing: {
		$root: {
			purpose: 'spacing',
			description: 'A convenient reference for the "md" spacing size',
		},
		xs: 'spacing',
		sm: 'spacing',
		md: 'spacing',
		lg: 'spacing',
		xl: 'spacing',
	},

	// other cosmetics
	lineWidth: {
		$root: {
			purpose: 'border-width',
			description: 'A convenient reference for the "md" border width',
		},
		sm: {
			purpose: 'border-width',
			description:
				'A hairline border width. Always >= 1px. If the global border width is small, this may be the same as "md"',
		},
		md: {
			purpose: 'border-width',
			description: 'A general-purpose border width',
		},
		lg: {
			purpose: 'border-width',
			description: 'A thicker border, good for emphasis',
		},
	},
	radius: {
		$root: {
			purpose: 'border-radius',
			description: 'A convenient reference for the "md" border radius',
		},
		xs: 'border-radius',
		sm: 'border-radius',
		md: 'border-radius',
		lg: 'border-radius',
		xl: 'border-radius',
	},
	shadow: {
		$root: {
			purpose: 'shadow',
			description: 'A convenient reference for the "md" shadow level',
		},
		color: {
			purpose: 'color',
			description:
				'If specified, this token overrides shadow colors from primitives',
		},
		sm: shadowIntents,
		md: shadowIntents,
		lg: shadowIntents,
		xl: shadowIntents,
	},
	easing: {
		$root: {
			purpose: 'easing-function',
			description: 'A convenient reference for the "medium" easing',
		},
		tight: {
			purpose: 'easing-function',
			description: 'A short, snappy easing, good for tight interactions',
		},
		medium: {
			purpose: 'easing-function',
			description: 'A medium easing, good for general use',
		},
		loose: {
			purpose: 'easing-function',
			description:
				'A long, relaxed easing, good for slow interactions and animations',
		},
	},
	duration: {
		$root: {
			purpose: 'duration',
			description: 'A convenient reference for the "medium" duration',
		},
		fast: {
			purpose: 'duration',
			description:
				'A short, snappy duration, good for fast interactions and large animations',
		},
		medium: {
			purpose: 'duration',
			description:
				'A medium duration, good for general use, fast enough for interactions',
		},
		slow: {
			purpose: 'duration',
			description:
				'A long, relaxed duration, good for slow interactions and animations',
		},
	},
} satisfies SimpleTokenSchema;

export type ArborModeSchema = typeof arborModeSchema;

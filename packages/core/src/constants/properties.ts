export const PROPS = {
	// user config
	USER: {
		COLOR: {
			PRIMARY_HUE: '--u-c-primary-hue',
			NAMED_HUE: (name: string) => `--u-c-${name}-hue`,
		},
		SATURATION: '--u-saturation',
		SHADOW_SPREAD: '--u-shadow-spread',
		CORNER_SCALE: '--u-corner-scale',
		SPACING_SCALE: '--u-spacing-scale',
		BORDER_SCALE: '--u-border-scale',
	},
	// palettes
	PALETTE: {
		NAME: '--p-name',
		MAIN_HUE: '--p-main-hue',
		SATURATION: '--p-saturation',
		LIGHTNESS_SPREAD: '--l-lightness-spread',
		NAMED_HUE: (name: string) => `--p-${name}-hue`,

		// the active palette's color shade props
		SHADES: {
			WASH: '--p-shade-wash',
			LIGHT: '--p-shade-light',
			MID: '--p-shade-mid',
			DARK: '--p-shade-dark',
			INK: '--p-shade-ink',
		},
		// the active palette's gray shade props
		GRAY_SHADES: {
			WASH: '--p-gray-shade-wash',
			LIGHT: '--p-gray-shade-light',
			MID: '--p-gray-shade-mid',
			DARK: '--p-gray-shade-dark',
			INK: '--p-gray-shade-ink',
		},
		// generate named shade prop names for a particular palette
		NAMED_SHADES: (name: string) => ({
			WASH: `--p-${name}-shade-wash`,
			LIGHT: `--p-${name}-shade-light`,
			MID: `--p-${name}-shade-mid`,
			DARK: `--p-${name}-shade-dark`,
			INK: `--p-${name}-shade-ink`,
		}),
	},
	// light/dark
	MODE: {
		BLACK: '--m-black',
		WHITE: '--m-white',
		MULT: '--m-mult',
		L_NEUTRAL: '--m-l-neutral',
		L_RANGE_UP: '--m-l-range-up',
		L_RANGE_DOWN: '--m-l-range-down',
		S_NEUTRAL: '--m-s-neutral',
		S_RANGE_UP: '--m-s-range-up',
		S_RANGE_DOWN: '--m-s-range-down',
	},
	// color system
	COLOR: {
		INHERITED: '--ar-c-i',
		FINAL: '--ar-c',
		OPACITY: '--ar-c-op',
	},
	BACKGROUND_COLOR: {
		INHERITED: '--ar-bg-l',
		FINAL: '--ar-bg',
		OPACITY: '--ar-bg-op',
		// special token for assigning a different bg color for contrast calculations
		CONTRAST: '--ar-bg-contrast',
	},
	BORDER_COLOR: {
		ALL: {
			INHERITED: '--ar-bd-c-i',
			FINAL: '--ar-bd-c',
			OPACITY: '--ar-bd-c-op',
		},
		TOP: {
			INHERITED: '--ar-bd-t-c-i',
			FINAL: '--ar-bd-t-c',
			OPACITY: '--ar-bd-t-c-op',
		},
		RIGHT: {
			INHERITED: '--ar-bd-r-c-i',
			FINAL: '--ar-bd-r-c',
			OPACITY: '--ar-bd-r-c-op',
		},
		BOTTOM: {
			INHERITED: '--ar-bd-b-c-i',
			FINAL: '--ar-bd-b-c',
			OPACITY: '--ar-bd-b-c-op',
		},
		LEFT: {
			INHERITED: '--ar-bd-l-c-i',
			FINAL: '--ar-bd-l-c',
			OPACITY: '--ar-bd-l-c-op',
		},
	},
	RING_COLOR: {
		INHERITED: '--ar-ring-c-i',
		FINAL: '--ar-ring-c',
		OPACITY: '--ar-ring-c-op',
	},
	ACCENT_COLOR: {
		INHERITED: '--ar-accent-c-i',
		FINAL: '--ar-accent-c',
		OPACITY: '--ar-accent-c-op',
	},
	PLACEHOLDER_COLOR: {
		INHERITED: '--ar-ph-c-i',
		FINAL: '--ar-ph-c',
		OPACITY: '--ar-ph-c-op',
	},
	// grouping system
	GROUP: {
		// the odd/even convention avoids circular property references
		// by alternating the 'active' variable for odd or even depths
		EVEN: {
			DEPTH: '--ar-ge-depth',
			PADDING: {
				FINAL: '--ar-ge-p',
				LOCAL: '--ar-ge-p-l',
			},
			MARGIN: {
				FINAL: '--ar-ge-m',
				LOCAL: '--ar-ge-m-l',
			},
			RADIUS: {
				FINAL: '--ar-ge-rd',
				LOCAL: '--ar-ge-rd-l',
				PARENT: '--ar-ge-rd-p',
			},
			GAP: {
				FINAL: '--ar-ge-gp',
				LOCAL: '--ar-ge-gp-l',
			},
		},
		ODD: {
			DEPTH: '--ar-go-depth',
			PADDING: {
				FINAL: '--ar-go-p',
				LOCAL: '--ar-go-p-l',
			},
			MARGIN: {
				FINAL: '--ar-go-m',
				LOCAL: '--ar-go-m-l',
			},
			RADIUS: {
				FINAL: '--ar-go-rd',
				LOCAL: '--ar-go-rd-l',
				PARENT: '--ar-go-rd-p',
			},
			GAP: {
				FINAL: '--ar-go-gp',
				LOCAL: '--ar-go-gp-l',
			},
		},
		EVEN_ODD: '--ar-gr-eo',
		DEPTH: '--ar-gr-depth',
		RADIUS_FALLBACK: '--ar-gr-rd-fb',
	},

	// built-ins from Uno
	BUILT_IN: {
		RING_COLOR: '--ar-ring-color',
	},
};

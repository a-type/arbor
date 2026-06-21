import { createModeSchema } from '@arbor-css/modes';

export const typographySemantics = createModeSchema({
	weight: {
		$root: {
			purpose: 'font-weight',
			description: 'A convenient reference for the "normal" font weight',
		},
		thin: {
			purpose: 'font-weight',
			description: 'A thin font weight, good for large or de-emphasized text',
		},
		normal: {
			purpose: 'font-weight',
			description: 'A normal font weight, good for general use',
		},
		bold: {
			purpose: 'font-weight',
			description: 'A bold font weight, good for small or emphasized text',
		},
	},
	size: {
		$root: {
			purpose: 'font-size',
			description: 'A convenient reference for the "md" font size',
		},
		sm: {
			purpose: 'font-size',
			description: 'A small font size, good for captions and fine print',
		},
		md: {
			purpose: 'font-size',
			description: 'A medium font size, good for general use',
		},
		lg: {
			purpose: 'font-size',
			description: 'A large font size, good for headings and emphasis',
		},
	},
	lineHeight: {
		$root: {
			purpose: 'line-height',
			description: 'A convenient reference for the "normal" line height',
		},
		tight: {
			purpose: 'line-height',
			description:
				'A tight line height, good for large text or when space is limited',
		},
		normal: {
			purpose: 'line-height',
			description: 'A normal line height, good for general use',
		},
		loose: {
			purpose: 'line-height',
			description:
				'A loose line height, good for small text or when readability is a concern',
		},
	},
	letterSpacing: {
		$root: {
			purpose: 'letter-spacing',
			description: 'A convenient reference for the "normal" letter spacing',
		},
		tight: {
			purpose: 'letter-spacing',
			description:
				'A tight letter spacing, good for large text or when space is limited',
		},
		normal: {
			purpose: 'letter-spacing',
			description: 'A normal letter spacing, good for general use',
		},
		loose: {
			purpose: 'letter-spacing',
			description:
				'A loose letter spacing, good for small text or when readability is a concern',
		},
	},
});

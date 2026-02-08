import { Shortcut } from 'unocss';

const justifies = [
	'start',
	'center',
	'end',
	'between',
	'around',
	'evenly',
] as const;
const items = ['start', 'center', 'end', 'stretch'] as const;

export const flexShortcuts: Shortcut[] = [
	[
		new RegExp(
			`(row|col)(?:\/(${items.join('|')}))?(?:\/(${justifies.join('|')}))?`,
		),
		([, direction, item, justify]) => {
			let base = `flex flex-${direction}`;
			if (item) base += ` items-${item}`;
			if (justify) base += ` justify-${justify}`;
			return base;
		},
		{ autocomplete: `(row|col)/(${items.join('|')})-(${justifies.join('|')})` },
	],
];

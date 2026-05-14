export const globalKeywords = [
	'inherit',
	'initial',
	'revert',
	'revert-layer',
	'unset',
];

export const directionMap = {
	'': [''],
	l: ['inline-start'],
	r: ['inline-end'],
	t: ['block-start'],
	b: ['block-end'],
	s: ['inline-start'],
	e: ['inline-end'],
	x: ['inline'],
	y: ['block'],
	bs: ['block-start'],
	be: ['block-end'],
	is: ['inline-start'],
	ie: ['inline-end'],
	block: ['block-start', 'block-end'],
	inline: ['inline-start', 'inline-end'],
	'block-start': ['block-start'],
	'block-end': ['block-end'],
	'inline-start': ['inline-start'],
	'inline-end': ['inline-end'],
} as const;
// border-radius specific
export const cornerMap = {
	'': [''],
	l: ['bottom-left', 'top-left'],
	r: ['bottom-right', 'top-right'],
	t: ['top-left', 'top-right'],
	b: ['bottom-left', 'bottom-right'],
	bl: ['bottom-left'],
	br: ['bottom-right'],
	tl: ['top-left'],
	tr: ['top-right'],
} as const;
export const sidesMap = {
	'': [''],
	t: ['top'],
	r: ['right'],
	b: ['bottom'],
	l: ['left'],
	x: ['left', 'right'],
	y: ['top', 'bottom'],
};
export const directionMapEntries = Object.entries(directionMap).sort((a, b) => {
	// "" should be first, so it doesn't interfere with more specific matches
	if (a[0] === '') return -1;
	if (b[0] === '') return 1;
	return b[0].length - a[0].length;
});
export type DirectionMapKey = keyof typeof directionMap;
export const cornerMapEntries = Object.entries(cornerMap);
export type CornerMapKey = keyof typeof cornerMap;
export const sideMapEntries = Object.entries(sidesMap);
export type SidesMapKey = keyof typeof sidesMap;

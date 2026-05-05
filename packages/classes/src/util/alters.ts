export function lighten(base: string, level: string) {
	return `color-mix(in oklch, white ${parseInt(level, 10) * 10}%, ${base})`;
}

export function darken(base: string, level: string) {
	return `color-mix(in oklch, black ${parseInt(level, 10) * 2}%, ${base})`;
}

export const colorAlters: Record<
	string,
	(base: string, level: string) => string
> = {
	l: lighten,
	lighten,
	d: darken,
	darken,
};

export const colorAltersMatch = '(l|lighten|d|darken)';

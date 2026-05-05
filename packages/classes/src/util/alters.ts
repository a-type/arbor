function mod(base: string, level: number, sign: number) {
	// TODO: not hardcode white/black... figure out how to interpret these
	// with schemes/modes
	return `color-mix(in oklch, ${base} ${50 + level * sign * 10}%, ${sign === 1 ? 'white' : 'black'})`;
}

export function lighten(base: string, level: string) {
	return mod(base, parseInt(level, 10), 1);
}

export function darken(base: string, level: string) {
	return mod(base, parseInt(level, 10), -1);
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

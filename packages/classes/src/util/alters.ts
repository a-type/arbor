import { $systemProps } from '@arbor-css/core';

function tweak({
	value,
	darkStep,
	lightStep,
	step,
}: {
	value: string;
	step: string;
	darkStep: number;
	lightStep: number;
}) {
	return `calc((1 + ((${$systemProps.scheme.whenLight.varFallback(1)} * ${lightStep / 100}) + (${$systemProps.scheme.whenDark.varFallback(0)} * ${darkStep / 100})) * ${step}) * ${value})`;
}

export function lighten(base: string, level: string) {
	return `oklch(from ${base} ${tweak({
		value: 'l',
		step: level,
		lightStep: 2,
		darkStep: -7,
	})} ${tweak({
		value: 'c',
		step: level,
		lightStep: -10,
		darkStep: -3,
	})} h)`;
}

export function darken(base: string, level: string) {
	return `oklch(from ${base} ${tweak({
		value: 'l',
		step: level,
		lightStep: -2,
		darkStep: 6,
	})} ${tweak({
		value: 'c',
		step: level,
		lightStep: 1,
		darkStep: -9,
	})} h)`;
}

export function desaturate(base: string, level: string) {
	return `oklch(from ${base} l ${tweak({
		value: 'c',
		step: level,
		lightStep: -20,
		darkStep: -20,
	})} h)`;
}

export function saturate(base: string, level: string) {
	return `oklch(from ${base} l ${tweak({
		value: 'c',
		step: level,
		lightStep: 20,
		darkStep: 20,
	})} h)`;
}

export const colorAlters: Record<
	string,
	(base: string, level: string) => string
> = {
	l: lighten,
	lighten,
	d: darken,
	darken,
	s: saturate,
	saturate,
	ds: desaturate,
	desaturate,
};

export const colorAltersMatch = '(l|lighten|d|darken|s|saturate|ds|desaturate)';

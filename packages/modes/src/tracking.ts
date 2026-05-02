import { Token } from '@arbor-css/tokens';

export type TrackedValue = {
	'@@TRACKED': true;
	dependencies: Token[];
	value: string;
};

export function isTrackedValue(value: any): value is TrackedValue {
	return value && typeof value === 'object' && '@@TRACKED' in value;
}

/**
 * A tagged template literal which interpolates Tokens and
 * tracks them as dependencies.
 */
export const derive = (
	strings: TemplateStringsArray,
	...values: Token[]
): TrackedValue => {
	const result = strings.reduce((acc, str, i) => {
		const value = values[i - 1];
		if (value) {
			acc += value.var;
		}
		acc += str;
		return acc;
	}, '');
	return { value: result, dependencies: values, '@@TRACKED': true };
};

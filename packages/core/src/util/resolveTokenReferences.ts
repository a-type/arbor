import { isCalcEquation, printEquation } from '@arbor-css/calc';
import { ArborPreset } from '@arbor-css/preset/config';
import { isToken } from '@arbor-css/tokens';
import { flattenAndApplyTokenValues } from './flattenAndApplyTokenValues.js';

export function resolveTokenReferences(
	preset: ArborPreset<any, any>,
	tokenName: string,
	colorScheme: string = 'light',
): string | undefined {
	const flat = flattenAndApplyTokenValues(
		{
			colors: preset.primitives.$tokens.colors,
			shadows: preset.primitives.$tokens.shadows,
			spacing: preset.primitives.$tokens.spacing,
			typography: preset.primitives.$tokens.typography,
			mode: preset.modes.base.schema.$tokens,
		},
		{
			colors: preset.primitives.colors[colorScheme].colors,
			shadows: preset.primitives.shadows.levels,
			spacing: preset.primitives.spacing.levels,
			typography: preset.primitives.typography.levels,
			mode: preset.modes.base.values,
		},
	);

	let current = tokenName;
	const visited = new Set<string>();
	while (current) {
		if (visited.has(current)) {
			// circular reference
			return undefined;
		}
		visited.add(current);

		const value = flat[current];
		if (!value) {
			return undefined;
		}
		if (isToken(value)) {
			current = value.name;
		} else if (isCalcEquation(value)) {
			// a calc value could be just a plain var(...) ref,
			// in which case we can keep going
			const printed = printEquation(value);
			const propName = extractPropertyRefName(printed);
			if (!propName) {
				return undefined;
			}
			current = propName;
		} else if (typeof value === 'string') {
			// if we got a string, check if it's a var(...) ref.
			const propName = extractPropertyRefName(value);
			if (!propName) {
				return value;
			}
			current = propName;
		} else {
			// not sure what this is.
			return undefined;
		}
	}
}

function extractPropertyRefName(value: string): string | null {
	const match = /^var\((--[^,)\]]+)\)$/u.exec(value);
	return match ? match[1] : null;
}

import { isCalcEquation, printEquation } from '@arbor-css/calc';
import { ArborPreset } from '@arbor-css/preset/config';
import { isToken } from '@arbor-css/tokens';
import { flattenAndApplyTokenValues } from './flattenAndApplyTokenValues.js';

export function resolveTokenReferences(
	preset: ArborPreset<any, any>,
	tokenName: string,
	colorScheme: string = 'light',
): string | undefined {
	const flat = flattenAndApplyTokenValues(preset.$.mode, preset.baseMode);

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

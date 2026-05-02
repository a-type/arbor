import { isToken, Token } from '@arbor-css/tokens';
import {
	isModeValue,
	ModeInstance,
	ModeSchemaLevel,
	ModeValue,
	PartialModeInstance,
} from './createModeSchema.js';
import { isTrackedValue } from './tracking.js';

function toFlatKeys<V = any>(
	obj: Record<string, any>,
	stop: (value: any) => boolean = (value) =>
		typeof value !== 'object' || value === null,
	prefix = '',
): Record<string, V> {
	const flatObj: Record<string, V> = {};
	for (const key in obj) {
		const value = obj[key];
		const flatKey = prefix ? `${prefix}-${key}` : key;
		if (!stop(value)) {
			Object.assign(flatObj, toFlatKeys(value, stop, flatKey));
		} else {
			flatObj[flatKey] = value;
		}
	}
	return flatObj;
}

/**
 * For a given Token, returns which values in the base mode depend on it.
 * When any mode defines a value, we check the corresponding token with
 * this function to decide if we need to interpolate any base values that
 * must be recomputed alongside it since CSS custom properties are eagerly
 * evaluated at declaration and won't update due to downstream changes to
 * properties they derive from.
 */
function getBaseModeDependents(
	baseMode: ModeInstance<any>,
	token: Token,
): Record<string, string> {
	const dependents: Record<string, string> = {};
	const flatBase = toFlatKeys(baseMode.values, isModeValue);
	const flatTokens = toFlatKeys<Token>(baseMode.schema.$tokens, isToken);
	for (const key in flatBase) {
		const value = flatBase[key];
		if (isTrackedValue(value)) {
			if (value.dependencies.some((dep) => dep.name === token.name)) {
				const tokenForKey = flatTokens[key];
				dependents[tokenForKey.name] = value.value;
				// recurse to find any values that depend on this dependent as well
				if (tokenForKey) {
					Object.assign(
						dependents,
						getBaseModeDependents(baseMode, tokenForKey),
					);
				}
			}
		}
	}
	return dependents;
}

export function modeToCss<TModeShape extends ModeSchemaLevel>(
	mode: PartialModeInstance<TModeShape>,
	baseMode: ModeInstance<TModeShape>,
): string {
	const flatValues = toFlatKeys<ModeValue>(mode.values, isModeValue);
	const flatTokens = toFlatKeys<Token>(mode.schema.$tokens, isToken);

	const cssVars: Record<string, string> = {};
	const lowPriorityVars: Record<string, string> = {};

	for (const key in flatValues) {
		const value = flatValues[key];
		const tokenVar = flatTokens[key];
		if (!tokenVar) {
			// ignore values which don't align with schema
			continue;
		}

		if (isToken(value)) {
			cssVars[tokenVar.name] = value.var;
		} else if (isTrackedValue(value)) {
			cssVars[tokenVar.name] = value.value;
		} else if (typeof value === 'string' || typeof value === 'number') {
			cssVars[tokenVar.name] = value.toString();
		} else {
			throw new Error(
				`Invalid value for token ${tokenVar.name}: ${value}. Must be a string, number, or $token (in mode ${mode.config.name})`,
			);
		}

		// If this value corresponds to a token in the base mode, we need to check if any other base mode values depend on it and include them as well since CSS custom properties are eagerly evaluated.
		const baseDeps = getBaseModeDependents(baseMode, tokenVar);
		Object.assign(lowPriorityVars, baseDeps);
	}

	return Object.entries({
		...lowPriorityVars,
		...cssVars,
	}).reduce((acc, [key, value]) => `${acc}${key}: ${value};\n`, '');
}

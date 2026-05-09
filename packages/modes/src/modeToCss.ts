import { $systemProps } from '@arbor-css/globals';
import { isToken, Token } from '@arbor-css/tokens';
import { toFlatKeys } from '@arbor-css/util';
import {
	isModeValue,
	ModeInstance,
	ModeSchemaLevel,
	ModeValue,
	PartialModeInstance,
} from './createModeSchema.js';
import { isTrackedValue } from './tracking.js';

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
	seen: Set<Token> = new Set(),
): Record<string, string> {
	if (seen.has(token)) {
		throw new Error(
			`Circular dependency detected for token ${token.name} in mode ${baseMode.config.name}`,
		);
	}
	seen.add(token);
	const dependents: Record<string, string> = {};
	const flatBase = toFlatKeys(baseMode.values, isModeValue, { separator: '-' });
	const flatTokens = toFlatKeys<Token>(baseMode.schema.$tokens, isToken, {
		separator: '-',
	});
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
						getBaseModeDependents(baseMode, tokenForKey, seen),
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
	const flatValues = toFlatKeys<ModeValue>(mode.values, isModeValue, {
		separator: '-',
	});
	const flatTokens = toFlatKeys<Token>(mode.schema.$tokens, isToken, {
		separator: '-',
	});

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

	const valuesCss = Object.entries({
		...lowPriorityVars,
		...cssVars,
	}).reduce((acc, [key, value]) => `${acc}${key}: ${value};\n`, '');
	const content = [valuesCss, mode.schema.extraCss].filter(Boolean).join('\n');

	return `.\\@mode-${mode.config.name},
[data-mode-${mode.config.name}=""],
:where(.\\@mode-${mode.config.name} [class^="\\@scheme-"]),
:where([data-mode-${mode.config.name}=""] [class^="\\@scheme-"]) {
	${$systemProps.labels.mode.assign(mode.config.name)}
	${content}
}
`;
}

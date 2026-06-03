import { isCalcEquation, printEquation } from '@arbor-css/calc';
import {
	getModeInternals,
	isModeValue,
	ModeInstance,
	ModeValue,
} from '@arbor-css/modes';
import { ArborPreset } from '@arbor-css/preset';
import {
	isToken,
	SimpleTokensAsTokenDefinitions,
	SimpleTokenSchema,
	Token,
} from '@arbor-css/tokens';
import { toFlatKeys } from '@arbor-css/util';

export function modeToCss<TModeShape extends SimpleTokenSchema>(
	mode: ModeInstance<TModeShape>,
	preset: ArborPreset<TModeShape>,
): string {
	const flatValues = toFlatKeys<ModeValue>(mode, isModeValue, {
		separator: '-',
	});
	const flatTokens = toFlatKeys<Token>(preset.$.mode, isToken, {
		separator: '-',
	});

	const modeInternals = getModeInternals(mode);

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
		} else if (isCalcEquation(value)) {
			// TODO: add globals to parameters of this function and computeEquation
			// instead?
			cssVars[tokenVar.name] = printEquation(value);
		} else if (typeof value === 'string' || typeof value === 'number') {
			cssVars[tokenVar.name] = value.toString();
		} else {
			throw new Error(
				`Invalid value for token ${tokenVar.name}: ${value}. Must be a string, number, or $token`,
			);
		}

		// If this value corresponds to a token in the base mode, we need to check if any other base mode values depend on it and include them as well since CSS custom properties are eagerly evaluated.
		const baseDeps = getBaseModeDependents(
			preset.baseMode,
			tokenVar,
			preset.$.mode,
		);
		Object.assign(lowPriorityVars, baseDeps);
	}

	const valuesCss = Object.entries({
		...lowPriorityVars,
		...cssVars,
	}).reduce((acc, [key, value]) => `${acc}${key}: ${value};\n`, '');
	const content = [valuesCss, preset.modeSchema.extraCss]
		.filter(Boolean)
		.join('\n');

	const simpleSelector = `.\\@mode-${modeInternals.name}`;
	const selectors = [simpleSelector, ...(modeInternals.extraSelectors ?? [])];

	if (mode === preset.baseMode) {
		// base mode values are applied to :root and all scheme selectors since they can be referenced by any mode and we want them to update when the base mode changes
		selectors.push(
			...selectors.map((s) => s.replace(`.\\@mode-${mode.$name}`, ':root')),
		);
	}

	return `${selectors.join(', ')} {
	${preset.$.system.meta.modeName.assign(modeInternals.name)}
	${content}
	${modeInternals.extraCss ?? ''}
}
`;
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
	modeTokens: SimpleTokensAsTokenDefinitions<any>,
	visiting: string[] = [],
): Record<string, string> {
	const cycleStart = visiting.findIndex((name) => name === token.name);
	if (cycleStart !== -1) {
		// note: this only detects cycles in the base mode, not
		// in derived modes. is that needed?
		const cycleChain = [...visiting.slice(cycleStart), token.name].join(' -> ');
		throw new Error(
			`Circular dependency detected in mode ${baseMode.$name}: ${cycleChain}`,
		);
	}
	const nextVisiting = [...visiting, token.name];
	const dependents: Record<string, string> = {};
	const flatBase = toFlatKeys(baseMode, isModeValue, { separator: '-' });
	const flatTokens = toFlatKeys<Token>(modeTokens, isToken, {
		separator: '-',
	});
	for (const key in flatBase) {
		const value = flatBase[key];
		if (isCalcEquation(value)) {
			if (value.tokens.some((dep) => dep.name === token.name)) {
				const tokenForKey = flatTokens[key];
				if (!tokenForKey) {
					continue;
				}
				dependents[tokenForKey.name] = printEquation(value);
				// recurse to find any values that depend on this dependent as well
				Object.assign(
					dependents,
					getBaseModeDependents(
						baseMode,
						tokenForKey,
						modeTokens,
						nextVisiting,
					),
				);
			}
		}
	}
	return dependents;
}

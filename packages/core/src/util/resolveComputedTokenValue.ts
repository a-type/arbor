import {
	$,
	computeEquation,
	isCalcEquation,
	printComputationResult,
	type Equation,
} from '@arbor-css/calc';
import { ArborPreset, getInternals } from '@arbor-css/preset/config';
import { isToken, type Token, tokenSchemaToList } from '@arbor-css/tokens';

type PropertyValueMap = Record<string, string | Equation | undefined>;

export function resolveComputedTokenValue(
	preset: ArborPreset<any, any>,
	tokenName: string,
	propertyValues: PropertyValueMap = {},
): string | undefined {
	const resolvedValues = getResolvedTokenValues(preset);
	const tokens = tokenSchemaToList(preset.$);
	const token = tokens.find((candidate) => candidate.name === tokenName);
	if (!token) {
		return undefined;
	}

	const tokenValue = resolvedValues[token.name];
	if (tokenValue === undefined) {
		return undefined;
	}

	const contextValues: PropertyValueMap = {
		...resolvedValues,
		...propertyValues,
	};

	const computed =
		typeof tokenValue === 'string' ?
			computeEquation($.val(tokenValue), {
				propertyValues: contextValues,
				skipBaking: false,
			})
		: 	computeEquation(tokenValue, {
				propertyValues: contextValues,
				skipBaking: false,
			});

	return printComputationResult(computed);
}

function getResolvedTokenValues(
	preset: ArborPreset<any, any>,
): Record<string, string | Equation> {
	const internals = getInternals(preset);
	const colorScheme = internals.defaultScheme;
	const schemeValues = internals.primitiveValues.color[colorScheme];

	const values: Record<string, string | Equation> = {
		...preset.context.getGlobalPropertyAssignments(),
	};

	applyKnownTokenValues(preset.$.primitives.color, schemeValues?.colors, values);
	applyKnownTokenValues(
		preset.$.primitives.typography,
		internals.primitiveValues.typography.levels,
		values,
	);
	applyKnownTokenValues(
		preset.$.primitives.spacing,
		internals.primitiveValues.spacing.levels,
		values,
	);
	applyKnownTokenValues(
		preset.$.primitives.shadow,
		internals.primitiveValues.shadow.levels,
		values,
	);
	applyKnownTokenValues(
		preset.$.primitives.easing,
		internals.primitiveValues.easing,
		values,
	);
	applyKnownTokenValues(
		preset.$.primitives.duration,
		internals.primitiveValues.duration,
		values,
	);
	applyKnownTokenValues(preset.$.mode, preset.baseMode, values);

	applyKnownTokenValues(
		preset.$.system.meta,
		{
			modeName: 'base',
			schemeName: colorScheme,
			scheme: {
				invertMultiplier: schemeValues?.isDark ? -1 : 1,
				whenDark: schemeValues?.isDark ? 1 : 0,
				whenLight: schemeValues?.isDark ? 0 : 1,
				trueLight: schemeValues?.isDark ? 'black' : 'white',
				trueHeavy: schemeValues?.isDark ? 'white' : 'black',
			},
		},
		values,
	);

	return values;
}

function applyKnownTokenValues(
	tokenNode: any,
	valueNode: any,
	result: Record<string, string | Equation>,
) {
	if (!tokenNode || !valueNode || typeof tokenNode !== 'object') {
		return;
	}

	for (const key in tokenNode) {
		const tokenValue = tokenNode[key];
		const resolvedValue = valueNode[key];

		if (resolvedValue === undefined) {
			continue;
		}

		if (isToken(tokenValue)) {
			const normalized = normalizeResolvedValue(resolvedValue);
			if (normalized !== undefined) {
				result[tokenValue.name] = normalized;
			}
			continue;
		}

		if (typeof tokenValue === 'object' && tokenValue !== null) {
			applyKnownTokenValues(tokenValue, resolvedValue, result);
		}
	}
}

function normalizeResolvedValue(value: unknown): string | Equation | undefined {
	if (typeof value === 'string' || typeof value === 'number') {
		return String(value);
	}

	if (isToken(value)) {
		return value.var;
	}

	if (isCalcEquation(value)) {
		return value;
	}

	return undefined;
}

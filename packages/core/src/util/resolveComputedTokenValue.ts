import {
	computeEquation,
	css,
	isCalcEquation,
	printComputationResult,
	type Equation,
} from '@arbor-css/calc';
import { ArborPreset, getInternals } from '@arbor-css/preset/config';
import { isToken, tokenSchemaToList } from '@arbor-css/tokens';

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

	const computed = computeEquation(
		css`
			${tokenValue}
		`,
		{
			propertyValues: contextValues,
			skipBaking: false,
		},
	);

	return printComputationResult(computed);
}

function getResolvedTokenValues(
	preset: ArborPreset<any, any>,
): Record<string, string | Equation> {
	const internals = getInternals(preset);
	const colorScheme = internals.defaultScheme;

	const values: Record<string, string | Equation> = {};
	applyKnownTokenValues(preset.$.mode, preset.baseMode, values);

	applyKnownTokenValues(
		preset.$.system.meta,
		{
			modeName: 'base',
			schemeName: colorScheme,
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

import {
	isFunction,
	isMixin,
	type ArborFunction,
	type ArborMixin,
} from '@arbor-css/functions';
import {
	DEFAULT_MODE_TOKEN_PREFIX,
	type ArborResolvedPrefixes,
} from '@arbor-css/globals';
import type { AnyArborPreset } from '@arbor-css/preset/config';
import { flattenTokenSchema, type Token } from '@arbor-css/tokens';

type TokenMapValue = Token | ArborFunction | ArborMixin<any, any>;

export type TokenMap = Map<string, TokenMapValue>;

export interface PrefixValidationConfig {
	tokenPrefixes: string[];
	functionNamePrefix: string;
	mixinNamePrefix: string;
}

export interface ValidationIssue {
	name: string;
	kind: 'token' | 'function' | 'mixin';
	message: string;
	index: number;
	line: number;
	column: number;
}

function escapeRegex(value: string): string {
	return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function getLineStarts(content: string): number[] {
	const lineStarts = [0];
	for (let i = 0; i < content.length; i += 1) {
		if (content[i] === '\n') {
			lineStarts.push(i + 1);
		}
	}
	return lineStarts;
}

function indexToLineColumn(
	index: number,
	lineStarts: number[],
): { line: number; column: number } {
	let low = 0;
	let high = lineStarts.length - 1;
	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const lineStart = lineStarts[mid];
		const nextLineStart =
			mid + 1 < lineStarts.length ?
				lineStarts[mid + 1]
			:	Number.POSITIVE_INFINITY;
		if (index < lineStart) {
			high = mid - 1;
			continue;
		}
		if (index >= nextLineStart) {
			low = mid + 1;
			continue;
		}
		return {
			line: mid + 1,
			column: index - lineStart + 1,
		};
	}

	return {
		line: 1,
		column: index + 1,
	};
}

function addIssue(
	issues: ValidationIssue[],
	seen: Set<string>,
	lineStarts: number[],
	{
		name,
		kind,
		message,
		index,
	}: {
		name: string;
		kind: ValidationIssue['kind'];
		message: string;
		index: number;
	},
) {
	const key = `${kind}:${name}:${index}:${message}`;
	if (seen.has(key)) {
		return;
	}
	seen.add(key);
	const { line, column } = indexToLineColumn(index, lineStarts);
	issues.push({
		name,
		kind,
		message,
		index,
		line,
		column,
	});
}

export function createTokenMap(preset: AnyArborPreset): TokenMap {
	const tokenMap: TokenMap = new Map();

	for (const token of flattenTokenSchema(preset.$)) {
		tokenMap.set(token.name, token);
	}

	for (const fn of preset.functions ? Object.values(preset.functions) : []) {
		tokenMap.set(fn.name, fn);
	}

	for (const mixin of preset.mixins ? Object.values(preset.mixins) : []) {
		tokenMap.set(mixin.name, mixin);
	}

	return tokenMap;
}

export function createPrefixValidationConfig(
	tokenPrefixes: ArborResolvedPrefixes,
): PrefixValidationConfig {
	const configuredPrefixes = [
		tokenPrefixes.modeTokenPrefix,
		tokenPrefixes.primitiveTokenPrefix,
		tokenPrefixes.metaTokenPrefix,
		tokenPrefixes.refTokenPrefix,
		tokenPrefixes.mixinTokenPrefix,
		tokenPrefixes.functionNamePrefix,
		tokenPrefixes.mixinNamePrefix,
	].filter((value): value is string => typeof value === 'string');

	const declarationPrefixes = [...new Set(configuredPrefixes)];
	if (declarationPrefixes.length === 0) {
		declarationPrefixes.push(DEFAULT_MODE_TOKEN_PREFIX);
	}

	return {
		tokenPrefixes: declarationPrefixes,
		functionNamePrefix: tokenPrefixes.functionNamePrefix,
		mixinNamePrefix: tokenPrefixes.mixinNamePrefix,
	};
}

export function validateCssContent({
	content,
	tokenMap,
	prefixConfig,
}: {
	content: string;
	tokenMap: TokenMap;
	prefixConfig: PrefixValidationConfig;
}): ValidationIssue[] {
	const issues: ValidationIssue[] = [];
	const seen = new Set<string>();
	const lineStarts = getLineStarts(content);

	for (const prefix of prefixConfig.tokenPrefixes) {
		const generalPropertyUsageRegex = new RegExp(
			`[\\s(](${escapeRegex(prefix)}[\\w-]+)[\\s)]`,
			'gm',
		);
		for (const match of content.matchAll(generalPropertyUsageRegex)) {
			if (match.index === undefined) {
				continue;
			}
			const propertyName = match[1];
			const index = match.index;
			const matchedValue = tokenMap.get(propertyName);
			if (!matchedValue) {
				addIssue(issues, seen, lineStarts, {
					name: propertyName,
					kind: 'token',
					message: `Unknown Arbor token: ${propertyName}`,
					index,
				});
			}
		}

		const declarationRegex = new RegExp(
			`(^|[;{\\s])(${escapeRegex(prefix)}[\\w-]+)\\s*:`,
			'gm',
		);
		for (const match of content.matchAll(declarationRegex)) {
			if (match.index === undefined) {
				continue;
			}
			const name = match[2];
			const index = match.index + match[1].length;
			const matchedValue = tokenMap.get(name);
			if (!matchedValue) {
				addIssue(issues, seen, lineStarts, {
					name,
					kind: 'token',
					message: `Unknown Arbor token: ${name}`,
					index,
				});
				continue;
			}
			if (isFunction(matchedValue)) {
				addIssue(issues, seen, lineStarts, {
					name,
					kind: 'token',
					message: `Arbor functions cannot be used as property declarations: ${name}`,
					index,
				});
				continue;
			}
			if (isMixin(matchedValue)) {
				addIssue(issues, seen, lineStarts, {
					name,
					kind: 'token',
					message: `Arbor mixins cannot be used as property declarations: ${name}`,
					index,
				});
			}
		}
	}

	const functionCallRegex = new RegExp(
		`(${escapeRegex(prefixConfig.functionNamePrefix)}[\\w-]+)\\s*\\(`,
		'g',
	);
	for (const match of content.matchAll(functionCallRegex)) {
		if (match.index === undefined) {
			continue;
		}
		const name = match[1];
		const matchedValue = tokenMap.get(name);
		if (!matchedValue || !isFunction(matchedValue)) {
			addIssue(issues, seen, lineStarts, {
				name,
				kind: 'function',
				message: `Unknown Arbor function: ${name}`,
				index: match.index,
			});
		}
	}

	const mixinApplyRegex = new RegExp(
		`@apply\\s+(${escapeRegex(prefixConfig.mixinNamePrefix)}[\\w-]+)`,
		'g',
	);
	for (const match of content.matchAll(mixinApplyRegex)) {
		if (match.index === undefined) {
			continue;
		}
		const name = match[1];
		const nameIndex = match.index + match[0].indexOf(name);
		const matchedValue = tokenMap.get(name);
		if (!matchedValue || !isMixin(matchedValue)) {
			addIssue(issues, seen, lineStarts, {
				name,
				kind: 'mixin',
				message: `Unknown Arbor mixin: ${name}`,
				index: nameIndex,
			});
		}
	}

	return issues;
}

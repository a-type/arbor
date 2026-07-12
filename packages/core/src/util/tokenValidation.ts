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
import { flattenTokenSchema, isToken, type Token } from '@arbor-css/tokens';
import { createTokenRegexes } from './tokenRegex.js';

export type TokenMapValue = Token | ArborFunction | ArborMixin<any, any>;

export type TokenMap = Map<string, TokenMapValue>;

export interface PrefixValidationConfig {
	tokenPrefixes: string[];
	functionNamePrefix: string;
	mixinNamePrefix: string;
}

export interface InvalidTokenMatch {
	name: string;
	kind: 'token' | 'function' | 'mixin';
	reason: 'unknown' | 'invalid-declaration' | 'mixin-must-follow-apply';
	index: number;
	length: number;
	suggestions: string[];
}

function findSuggestions(names: string[], query: string, limit = 5): string[] {
	const normalized = query.trim().toLowerCase();
	if (!normalized) {
		return [];
	}

	return names
		.map((name) => ({
			name,
			normalized: name.toLowerCase(),
		}))
		.map((candidate) => ({
			name: candidate.name,
			distance: levenshtein(candidate.normalized, normalized),
			contains: candidate.normalized.includes(normalized),
			startsWith: candidate.normalized.startsWith(normalized.slice(0, 4)),
		}))
		.filter(
			(candidate) =>
				candidate.contains ||
				candidate.startsWith ||
				candidate.distance <= Math.max(3, Math.floor(normalized.length * 0.2)),
		)
		.sort((a, b) => {
			if (a.contains !== b.contains) {
				return a.contains ? -1 : 1;
			}
			if (a.startsWith !== b.startsWith) {
				return a.startsWith ? -1 : 1;
			}
			if (a.distance !== b.distance) {
				return a.distance - b.distance;
			}
			return a.name.localeCompare(b.name);
		})
		.map((candidate) => candidate.name)
		.slice(0, limit);
}

function levenshtein(a: string, b: string): number {
	if (a === b) return 0;
	if (a.length === 0) return b.length;
	if (b.length === 0) return a.length;

	const previous = new Array<number>(b.length + 1);
	const current = new Array<number>(b.length + 1);

	for (let j = 0; j <= b.length; j += 1) {
		previous[j] = j;
	}

	for (let i = 1; i <= a.length; i += 1) {
		current[0] = i;
		for (let j = 1; j <= b.length; j += 1) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			current[j] = Math.min(
				previous[j] + 1,
				current[j - 1] + 1,
				previous[j - 1] + cost,
			);
		}

		for (let j = 0; j <= b.length; j += 1) {
			previous[j] = current[j];
		}
	}

	return previous[b.length];
}

function escapeRegex(value: string): string {
	return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function stripBlockComments(content: string): string {
	return content.replace(/\/\*[\s\S]*?\*\//g, (match) =>
		match.replace(/[^\n]/g, ' '),
	);
}

function extractExternalPropsAllowList(content: string): Set<string> {
	const allowed = new Set<string>();
	const commentRegex = /\/\*([\s\S]*?)\*\//g;

	for (const match of content.matchAll(commentRegex)) {
		const body = match[1]?.replace(/^\s*\*\s?/gm, '').trim() ?? '';
		const directiveMatch = body.match(/@external-props:\s*([\s\S]*)/);
		if (!directiveMatch) {
			continue;
		}

		for (const rawName of directiveMatch[1].split(',')) {
			const name = rawName.trim();
			if (name) {
				allowed.add(name);
			}
		}
	}

	return allowed;
}

function pushUniqueMatch(
	matches: InvalidTokenMatch[],
	seen: Set<string>,
	match: InvalidTokenMatch,
) {
	const key = `${match.kind}:${match.reason}:${match.name}:${match.index}`;
	if (seen.has(key)) {
		return;
	}

	seen.add(key);
	matches.push(match);
}

function inferUnknownKind(
	name: string,
	prefixConfig: PrefixValidationConfig,
): InvalidTokenMatch['kind'] {
	if (name.startsWith(prefixConfig.mixinNamePrefix)) {
		return 'mixin';
	}
	if (name.startsWith(prefixConfig.functionNamePrefix)) {
		return 'function';
	}
	return 'token';
}

function getSuggestionsByKind(
	kind: InvalidTokenMatch['kind'],
	name: string,
	availableNames: {
		token: string[];
		function: string[];
		mixin: string[];
	},
): string[] {
	return findSuggestions(availableNames[kind], name);
}

export function formatInvalidTokenMatchMessage(
	match: InvalidTokenMatch,
): string {
	const suggestionSuffix =
		match.suggestions.length > 0 ?
			`. Did you mean: ${match.suggestions.join(', ')}`
		:	'';

	if (match.reason === 'unknown') {
		if (match.kind === 'function') {
			return `Unknown Arbor function: ${match.name}${suggestionSuffix}`;
		}
		if (match.kind === 'mixin') {
			return `Unknown Arbor mixin: ${match.name}${suggestionSuffix}`;
		}
		return `Unknown Arbor token: ${match.name}${suggestionSuffix}`;
	}

	if (match.reason === 'mixin-must-follow-apply') {
		return `@apply must precede mixin: ${match.name}`;
	}

	if (match.kind === 'function') {
		return `Arbor functions cannot be used as property declarations: ${match.name}`;
	}

	return `Arbor mixins cannot be used as property declarations: ${match.name}`;
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
		tokenPrefixes.metaTokenPrefix,
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

export function findInvalidTokenMatches({
	content,
	tokenMap,
	prefixConfig,
}: {
	content: string;
	tokenMap: TokenMap;
	prefixConfig: PrefixValidationConfig;
}): InvalidTokenMatch[] {
	const matches: InvalidTokenMatch[] = [];
	const seen = new Set<string>();
	const strippedContent = stripBlockComments(content);
	const externalProps = extractExternalPropsAllowList(content);
	const tokenRegexes = createTokenRegexes(prefixConfig.tokenPrefixes);
	const functionCallRegex = new RegExp(
		`(${escapeRegex(prefixConfig.functionNamePrefix)}[\\w-]+)\\s*\\(`,
		'g',
	);
	const mixinApplyRegex = new RegExp(
		`@apply\\s+(${escapeRegex(prefixConfig.mixinNamePrefix)}[\\w-]+)`,
		'g',
	);
	const availableNames = {
		token: Array.from(tokenMap.entries())
			.filter(([, value]) => isToken(value))
			.map(([name]) => name),
		function: Array.from(tokenMap.entries())
			.filter(([, value]) => isFunction(value))
			.map(([name]) => name),
		mixin: Array.from(tokenMap.entries())
			.filter(([, value]) => isMixin(value))
			.map(([name]) => name),
	};

	const declarationKeys = new Set<string>();
	for (const tokenRegex of tokenRegexes) {
		for (const match of strippedContent.matchAll(tokenRegex.declaration())) {
			if (match.index === undefined) {
				continue;
			}

			const name = match[2];
			const index = match.index + match[1].length;
			const key = `${index}:${name}`;
			if (declarationKeys.has(key)) {
				continue;
			}
			declarationKeys.add(key);

			if (externalProps.has(name)) {
				continue;
			}

			const matchedValue = tokenMap.get(name);
			if (!matchedValue) {
				pushUniqueMatch(matches, seen, {
					name,
					kind: 'token',
					reason: 'unknown',
					index,
					length: name.length,
					suggestions: getSuggestionsByKind('token', name, availableNames),
				});
				continue;
			}

			if (isFunction(matchedValue)) {
				pushUniqueMatch(matches, seen, {
					name,
					kind: 'function',
					reason: 'invalid-declaration',
					index,
					length: name.length,
					suggestions: [],
				});
				continue;
			}

			if (isMixin(matchedValue)) {
				pushUniqueMatch(matches, seen, {
					name,
					kind: 'mixin',
					reason: 'invalid-declaration',
					index,
					length: name.length,
					suggestions: [],
				});
			}
		}
	}

	const functionCallKeys = new Set<string>();
	for (const match of strippedContent.matchAll(functionCallRegex)) {
		if (match.index === undefined) {
			continue;
		}

		const name = match[1];
		const key = `${match.index}:${name}`;
		functionCallKeys.add(key);
		const matchedValue = tokenMap.get(name);
		if (!matchedValue || !isFunction(matchedValue)) {
			pushUniqueMatch(matches, seen, {
				name,
				kind: 'function',
				reason: 'unknown',
				index: match.index,
				length: name.length,
				suggestions: getSuggestionsByKind('function', name, availableNames),
			});
		}
	}

	const mixinApplyKeys = new Set<string>();
	for (const match of strippedContent.matchAll(mixinApplyRegex)) {
		if (match.index === undefined) {
			continue;
		}

		const name = match[1];
		const index = match.index + match[0].indexOf(name);
		const key = `${index}:${name}`;
		mixinApplyKeys.add(key);
		const matchedValue = tokenMap.get(name);
		if (!matchedValue || !isMixin(matchedValue)) {
			pushUniqueMatch(matches, seen, {
				name,
				kind: 'mixin',
				reason: 'unknown',
				index,
				length: name.length,
				suggestions: getSuggestionsByKind('mixin', name, availableNames),
			});
		}
	}

	for (const tokenRegex of tokenRegexes) {
		for (const match of strippedContent.matchAll(tokenRegex.anywhere())) {
			if (match.index === undefined) {
				continue;
			}

			const name = match[1];
			const key = `${match.index}:${name}`;
			if (
				declarationKeys.has(key) ||
				functionCallKeys.has(key) ||
				mixinApplyKeys.has(key)
			) {
				continue;
			}

			const matchedValue = tokenMap.get(name);
			if (!matchedValue) {
				const kind = inferUnknownKind(name, prefixConfig);
				pushUniqueMatch(matches, seen, {
					name,
					kind,
					reason: 'unknown',
					index: match.index,
					length: name.length,
					suggestions: getSuggestionsByKind(kind, name, availableNames),
				});
				continue;
			}

			if (isMixin(matchedValue)) {
				pushUniqueMatch(matches, seen, {
					name,
					kind: 'mixin',
					reason: 'mixin-must-follow-apply',
					index: match.index,
					length: name.length,
					suggestions: [],
				});
			}
		}
	}

	return matches.sort(
		(a, b) => a.index - b.index || a.name.localeCompare(b.name),
	);
}

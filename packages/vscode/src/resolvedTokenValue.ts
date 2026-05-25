import type { ArborFunction, Token } from '@arbor-css/core';
import { isToken, resolveTokenReferences } from '@arbor-css/core';
import type { ConfigState } from './tokenProvider.js';

export function resolveTokenValue(
	state: ConfigState,
	entry: Token | ArborFunction,
): string | null {
	if (!isToken(entry)) {
		return null;
	}

	return resolveTokenReferences(state.preset, entry.name) ?? null;
}

export function resolveColorTokenValue(
	state: ConfigState,
	entry: Token | ArborFunction,
): string | null {
	if (!isToken(entry) || entry.purpose !== 'color') {
		return null;
	}

	return resolveTokenValue(state, entry);
}

export function resolveColorTokenValueByName(
	state: ConfigState,
	tokenName: string,
): string | null {
	const entry = state.tokenMap.get(tokenName);
	if (!entry) {
		return null;
	}
	if (!isToken(entry) || entry.purpose !== 'color') {
		return null;
	}

	return resolveColorTokenValue(state, entry);
}

import type { ArborFunction, Token } from '@arbor-css/core';
import { isToken, resolveComputedTokenValue } from '@arbor-css/core';
import { createSimplifier } from '@arbor-css/css-eval';
import init, { transform } from 'lightningcss-wasm';
import type { ConfigState } from './tokenProvider.js';

const simplifier = init().then(() =>
	createSimplifier({
		transform: transform as any,
		options: {
			passes: 2,
		},
	}),
);

export async function resolveTokenValue(
	state: ConfigState,
	entry: Token | ArborFunction,
): Promise<string | null> {
	if (!isToken(entry)) {
		return null;
	}

	return (
		resolveComputedTokenValue(state.preset, entry.name, {
			simplifier: await simplifier,
		}) ?? null
	);
}

export async function resolveColorTokenValue(
	state: ConfigState,
	entry: Token | ArborFunction,
): Promise<string | null> {
	if (!isToken(entry) || entry.purpose !== 'color') {
		return null;
	}

	return (
		resolveComputedTokenValue(state.preset, entry.name, {
			simplifier: await simplifier,
		}) ?? null
	);
}

export async function resolveColorTokenValueByName(
	state: ConfigState,
	tokenName: string,
): Promise<string | null> {
	const entry = state.tokenMap.get(tokenName);
	if (!entry) {
		return null;
	}
	if (!isToken(entry) || entry.purpose !== 'color') {
		return null;
	}

	return await resolveColorTokenValue(state, entry);
}

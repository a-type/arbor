import type { ArborFunction, CssEnvValues, Token } from '@arbor-css/core';
import { isToken, resolveComputedTokenValue } from '@arbor-css/core';
import { createSimplifier } from '@arbor-css/css-eval';
import init, { transform } from 'lightningcss-wasm';
import * as vscode from 'vscode';
import type { ConfigState } from './tokenProvider.js';

const simplifier = init().then(() =>
	createSimplifier({
		transform: transform as any,
		options: {
			passes: 2,
		},
	}),
);

function getEnv(): CssEnvValues {
	const viewportWidth =
		vscode.workspace
			.getConfiguration('arborCss')
			.get<number>('simulatedViewportWidth') || undefined;
	const viewportHeight =
		vscode.workspace
			.getConfiguration('arborCss')
			.get<number>('simulatedViewportHeight') || undefined;
	const fontSize =
		vscode.workspace
			.getConfiguration('arborCss')
			.get<number>('simulatedRootFontSize') || undefined;

	return {
		deviceHeightPx: viewportHeight,
		deviceWidthPx: viewportWidth,
		remPx: fontSize,
	};
}

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
			envValues: getEnv(),
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
			envValues: getEnv(),
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

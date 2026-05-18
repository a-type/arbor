import { TOKEN_PREFIX } from '@arbor-css/core';

function escapeRegex(value: string): string {
	return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function createTokenRegex(prefix: string = TOKEN_PREFIX) {
	const escapedPrefix = escapeRegex(prefix);
	return {
		end: () => new RegExp(`(${escapedPrefix}([\\w-]+)?)$`, 'g'),
		anywhere: () => new RegExp(`(${escapedPrefix}([\\w-]+)?)`, 'g'),
	};
}

/** Matches an OKLCH color value */
export const OKLCH_RE = /^oklch\(/i;

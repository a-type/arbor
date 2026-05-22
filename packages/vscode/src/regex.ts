function escapeRegex(value: string): string {
	return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function createTokenRegex(prefix: string) {
	const escapedPrefix = escapeRegex(prefix);
	return {
		end: () => new RegExp(`(${escapedPrefix}([\\w-]+)?)$`, 'g'),
		anywhere: () => new RegExp(`(${escapedPrefix}([\\w-]+)?)`, 'g'),
	};
}

export function createTokenRegexes(prefixes: readonly string[]) {
	return prefixes.map((prefix) => createTokenRegex(prefix));
}

/** Matches an OKLCH color value */
export const OKLCH_RE = /^oklch\(/i;

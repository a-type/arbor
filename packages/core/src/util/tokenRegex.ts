function escapeRegex(value: string): string {
	return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function createTokenRegex(prefix: string) {
	return {
		end: () => new RegExp(`(${prefix}([\\w-]+)?)$`, 'g'),
		anywhere: () => new RegExp(`(${prefix}([\\w-]+)?)`, 'g'),
		declaration: () => new RegExp(`(^|[;{\\s])(${prefix}([\\w-]+)?)\\s*:`, 'g'),
	};
}

export function createTokenRegexes(prefixes: readonly string[]) {
	return prefixes.map((prefix) => createTokenRegex(escapeRegex(prefix)));
}

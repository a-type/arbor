import { CompletionValue, TokenMap } from './tokenProvider.js';

export function getTokenCompletions(tokenMap: TokenMap, start: string) {
	const results = new Array<{ name: string; value: CompletionValue }>();
	// namespaces can crop up multiple times - keep track
	const seenNamespaces = new Set<string>();
	for (const [p, token] of tokenMap) {
		if (!p.startsWith(start)) continue;
		const rest = p.slice(start.length);
		if (rest.length === 0) {
			// exact match - return the token
			results.push({ name: token.name, value: token });
			continue;
		}

		// special case: leading -:
		// if we have typed "--x" and the rest is then "-color-...",
		// we want to capture "--x-color". so if the first char
		// is "-" we slice it off.
		const restForSegment = rest.startsWith('-') ? rest.slice(1) : rest;
		const partial = restForSegment.includes('-');

		if (partial) {
			const nextSegment = restForSegment.slice(0, restForSegment.indexOf('-'));
			const segment =
				start + (rest.startsWith('-') ? `-${nextSegment}` : nextSegment);
			if (seenNamespaces.has(segment)) continue;
			seenNamespaces.add(segment);
			results.push({ name: segment, value: 'namespace' });
		} else {
			results.push({ name: token.name, value: token });
		}
	}

	return results;
}

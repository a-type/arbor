import { isToken, Token } from '@arbor-css/tokens';

export type TrackedValue = {
	'@@TRACKED': true;
	dependencies: Token[];
	value: string;
};

export function isTrackedValue(value: any): value is TrackedValue {
	return value && typeof value === 'object' && '@@TRACKED' in value;
}

export type DeriveEntry =
	| Token
	| {
			value: Token;
			fallback: DeriveEntry;
	  };

/**
 * A tagged template literal which interpolates Tokens and
 * tracks them as dependencies.
 */
export const derive = (
	strings: TemplateStringsArray,
	...values: DeriveEntry[]
): TrackedValue => {
	const dependencies: Token[] = [];
	const result = strings.reduce((acc, str, i) => {
		const value = values[i - 1];
		if (value) {
			if (isToken(value)) {
				dependencies.push(value);
				acc += value.var;
			} else {
				const flattened = flattenDeriveEntry(value);
				dependencies.push(...flattened);
				acc += writeVarFallbacks(flattened);
			}
		}
		acc += str;
		return acc;
	}, '');
	return { value: result, dependencies, '@@TRACKED': true };
};

function flattenDeriveEntry(entry: DeriveEntry): Token[] {
	if (isToken(entry)) {
		return [entry];
	} else {
		return [entry.value, ...flattenDeriveEntry(entry.fallback)];
	}
}

function writeVarFallbacks(tokens: Token[]): string {
	const copy = [...tokens];
	let latest = copy.pop()?.var;
	if (!latest) return '';
	while (copy.length > 0) {
		const next = copy.pop()!;
		latest = next.varFallback(latest);
	}
	return latest;
}

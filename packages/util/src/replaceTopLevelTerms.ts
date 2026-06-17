/**
 * Generalized util for walking through a string and
 * finding (and replacing) "terms" - substrings separated
 * by whitespace, but respecting parentheses. So for example, with input
 *`foo(bar(baz)) qux (a b)`
 * you would visit `foo(bar(baz))`, `qux`, and `(a b)`.
 */
export function replaceTopLevelTerms(
	input: string,
	replacer: (term: string) => string,
): string {
	let result = '';
	let currentTerm = '';
	let parenDepth = 0;

	for (let i = 0; i < input.length; i++) {
		const char = input[i];

		if (char === '(') {
			parenDepth++;
			currentTerm += char;
		} else if (char === ')') {
			parenDepth--;
			currentTerm += char;
		} else if (/\s/.test(char) && parenDepth === 0) {
			if (currentTerm) {
				result += replacer(currentTerm);
				currentTerm = '';
			}
			result += char; // preserve whitespace
		} else {
			currentTerm += char;
		}
	}

	if (currentTerm) {
		result += replacer(currentTerm);
	}

	return result;
}

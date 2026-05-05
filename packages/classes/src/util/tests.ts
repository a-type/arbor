/**
 * Best guess at whether something is a CSS color...
 * - matching color functions like rgb() or hsl()
 * - matching hex colors like #fff or #123456
 * - matching named CSS colors like "red" (really just any lowercase word)
 * This is not perfect, but should be sufficient for distinguishing between theme keys and literal colors in most cases.
 */
export function isColorLiteral(value: string) {
	return (
		/^(?:rgb|hsl|oklch|color)\(.+\)$/.test(value) ||
		/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ||
		/^[a-z]+$/.test(value)
	);
}

export function isNumericUnitLiteral(value: string) {
	return /^\d+(\w{1,3}|%)$/.test(value);
}

export function isNumericLiteral(value: string) {
	return /^\d+$/.test(value);
}

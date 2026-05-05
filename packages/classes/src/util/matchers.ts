export function dirRegex(suffix: string) {
	if (!suffix) return '';
	return `(?:-${suffix})`;
}

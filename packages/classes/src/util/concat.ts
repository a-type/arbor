export function dotConcat(...parts: (string | undefined)[]) {
	return parts.filter(Boolean).join('.');
}
export function dashConcat(...parts: (string | undefined)[]) {
	return parts.filter(Boolean).join('-');
}

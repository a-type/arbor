/**
 * Converts a nested object to a flat mapping of
 * concatenated keys to values. Pass a check to decide
 * when to stop recursing.
 */
export function toFlatKeys<V = any>(
	obj: Record<string, any>,
	stop: (value: any) => boolean = (value) =>
		typeof value !== 'object' || value === null,
	options: { separator?: string } = {},
	prefix = '',
): Record<string, V> {
	const flatObj: Record<string, V> = {};
	const separator = options.separator ?? '-';
	for (const key in obj) {
		const value = obj[key];
		const flatKey = prefix ? `${prefix}${separator}${key}` : key;
		if (!stop(value)) {
			Object.assign(flatObj, toFlatKeys(value, stop, options, flatKey));
		} else {
			flatObj[flatKey] = value;
		}
	}
	return flatObj;
}

/**
 * Takes a key like "action-primary-fg" and looks it up from a nested object.
 * We don't necessarily know if a - is part of the next key or a separator,
 * so we first try to find the longest matching key and then work our way down until we find a match or run out of keys.
 */
export function getByConcatKey(
	obj: Record<string, any>,
	concatKey: string,
	separator = '-',
): any {
	const parts = concatKey.split(separator);
	for (let i = parts.length; i > 0; i--) {
		const key = parts.slice(0, i).join(separator);
		if (key in obj) {
			const value = obj[key];
			if (i === parts.length) {
				return value;
			} else if (typeof value === 'object' && value !== null) {
				const restKey = parts.slice(i).join(separator);
				return getByConcatKey(value, restKey, separator);
			}
		}
	}
	return undefined;
}

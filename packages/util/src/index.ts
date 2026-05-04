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

export function getByConcatKey(
	obj: Record<string, any>,
	concatKey: string,
	separator = '-',
): any {
	const keys = concatKey.split(separator);
	let current: any = obj;
	for (const key of keys) {
		if (current[key] === undefined) {
			return undefined;
		}
		current = current[key];
	}
	return current;
}

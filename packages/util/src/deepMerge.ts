export function deepMerge<T>(target: T, ...sources: DeepPartial<T>[]): T {
	if (!sources.length) return target;
	const source = sources.shift()!;
	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				deepMerge(target[key], source[key] as any);
			} else {
				Object.assign(target, { [key]: source[key] });
			}
		}
	}
	return deepMerge(target, ...sources);
}

function isObject(item: any): item is Record<string, any> {
	return item && typeof item === 'object' && !Array.isArray(item);
}

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Walk an object structure and convert matching items using the supplied
 * function.
 */
export function convertStructure<In, Out>(
	input: any,
	matchConvertedItem: (item: any, path: (string | number)[]) => item is In,
	convert: (item: In, path: (string | number)[]) => Out,
	{
		path = [],
		...options
	}: {
		path?: (string | number)[];
	} = {},
): any {
	path ??= [];
	if (matchConvertedItem(input, path)) {
		return convert(input, path);
	} else if (Array.isArray(input)) {
		return input.map((item, index) =>
			convertStructure(item, matchConvertedItem, convert, {
				path: [...path, index],
				...options,
			}),
		);
	} else if (typeof input === 'object' && input !== null) {
		const output: Record<string, any> = {};
		for (const key in input) {
			output[key] = convertStructure(input[key], matchConvertedItem, convert, {
				path: [...path, key],
				...options,
			});
		}
		return output;
	} else {
		return input;
	}
}

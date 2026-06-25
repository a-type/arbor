export function replaceCssFunctionCall(
	source: string,
	prefix: string,
	replacer: (name: string, args: string[]) => string,
) {
	const indexOfFunction = source.indexOf(prefix);
	if (indexOfFunction === -1) {
		return source;
	}

	const nextParam = source.indexOf('(', indexOfFunction);
	if (nextParam === -1) {
		// No parameters, just replace the function name
		const functionName = source.slice(indexOfFunction);
		const replacement = replacer(functionName, []);
		return (
			source.slice(0, indexOfFunction) +
			replacement +
			source.slice(indexOfFunction + functionName.length)
		);
	}

	const functionName = source.slice(indexOfFunction, nextParam);

	const params = extractParamContents(
		source,
		indexOfFunction + functionName.length,
	);
	const args = extractTopLevelParams(params);
	const replacement = replacer(functionName, args);

	const beforeFunction = source.slice(0, indexOfFunction);
	const afterFunction = source.slice(
		indexOfFunction + functionName.length + params.length + 2,
	); // +2 for the parentheses

	return beforeFunction + replacement + afterFunction;
}

function extractParamContents(str: string, startIndex: number): string {
	let depth = 0;
	let groupStart = -1;
	for (let i = startIndex; i < str.length; i++) {
		const char = str[i];
		if (char === '(') {
			if (depth === 0) {
				groupStart = i;
			}
			depth++;
		} else if (char === ')') {
			depth--;
			if (depth === 0 && groupStart !== -1) {
				const groupContents = str.slice(groupStart + 1, i);
				return groupContents;
			}
		}
	}
	return str; // No more groups found
}

function extractTopLevelParams(paramString: string): string[] {
	const params: string[] = [];
	let depth = 0;
	let currentParamStart = 0;

	for (let i = 0; i < paramString.length; i++) {
		const char = paramString[i];

		if (char === '(') {
			depth++;
		} else if (char === ')') {
			depth--;
		} else if (char === ',' && depth === 0) {
			params.push(paramString.slice(currentParamStart, i).trim());
			currentParamStart = i + 1;
		}
	}

	if (currentParamStart < paramString.length) {
		params.push(paramString.slice(currentParamStart).trim());
	}

	return params;
}

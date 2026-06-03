import { FunctionParam } from '@arbor-css/core';

export function paramToCompletionInline(param: FunctionParam): string {
	if (typeof param === 'string') {
		return param;
	}
	return `${param.name}${param.fallback ? `=${param.fallback}` : ''}${param.type ? ` <${param.type}>` : ''}`;
}

import { $, CalcInterpolation } from '@arbor-css/calc';
import { isToken } from '@arbor-css/tokens';

export type CssProperty = `--${string}`;
export type FunctionParams = readonly CssProperty[];
export type ParamsAsInterpolations<TParams extends FunctionParams> = {
	[K in keyof TParams]: CalcInterpolation;
};

export function paramsAsString<TParams extends FunctionParams>(
	params: TParams,
	keepEmpty?: boolean,
): string {
	if (!params.length) {
		return keepEmpty ? '()' : '';
	}
	const list = params
		.map((p) => {
			if (isToken(p)) {
				const type = p.type ?? '*';
				const typeAnnotation = type === '*' ? '' : ` <${type}>`;
				return `var(${p.name}${typeAnnotation})` as CalcInterpolation;
			}
			return p;
		})
		.join(', ');
	return `(${list})`;
}

export function paramsAsInterpolations<TParams extends FunctionParams>(
	params: TParams,
): ParamsAsInterpolations<TParams> {
	return params.map((p) => {
		if (isToken(p)) {
			return $.token(p);
		}
		if (p.startsWith('--')) {
			return $.val(`var(${p})`);
		}
		return $.val(p);
	}) as ParamsAsInterpolations<TParams>;
}

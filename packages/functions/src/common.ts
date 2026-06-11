import { $, CalcInterpolation } from '@arbor-css/calc';
import { isToken, TokenType } from '@arbor-css/tokens';

export type CssProperty = `--${string}`;
export type FunctionParamWithMeta = {
	name: CssProperty;
	type?: TokenType;
	fallback?: string;
};
export type FunctionParam = CssProperty | FunctionParamWithMeta;
export type FunctionParams = readonly FunctionParam[];
export type ParamsAsInterpolations<TParams extends FunctionParams> = {
	[K in keyof TParams]: CalcInterpolation;
};
export type ParamsAsNames<TParams extends FunctionParams> = {
	[K in keyof TParams]: TParams[K] extends FunctionParamWithMeta ?
		TParams[K]['name']
	: TParams[K] extends CssProperty ? TParams[K]
	: never;
};
/**
 * Converts a function params list into an input record which makes
 * parameters with defaults optional.
 */
export type ParamsAsCallInputs<TParams extends FunctionParams> = {
	[K in keyof TParams as TParams[K] extends { fallback: string } ? never
	: TParams[K] extends FunctionParamWithMeta ? TParams[K]['name']
	: TParams[K] extends CssProperty ? TParams[K]
	: never]: CalcInterpolation;
} & {
	[K in keyof TParams as TParams[K] extends (
		{ name: CssProperty; fallback: string }
	) ?
		TParams[K]['name']
	:	never]?: CalcInterpolation;
};

export function isFunctionParamWithMeta(
	param: CssProperty | FunctionParamWithMeta,
): param is FunctionParamWithMeta {
	return typeof param === 'object' && 'name' in param;
}

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
		if (isFunctionParamWithMeta(p)) {
			const name = p.name;
			if (p.fallback) {
				return $.val(`var(${name}, ${p.fallback})`);
			}
			return $.val(`var(${name})`);
		}
		if (p.startsWith('--')) {
			return $.val(`var(${p})`);
		}
		return $.val(p);
	}) as ParamsAsInterpolations<TParams>;
}

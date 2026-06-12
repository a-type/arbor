import { CalcInterpolation, css } from '@arbor-css/calc';
import { createTokenFactory, isToken, PropertyType } from '@arbor-css/tokens';

export type CssProperty = `--${string}`;
export type FunctionParamWithMeta = {
	name: CssProperty;
	type?: PropertyType;
	fallback?: string;
	description?: string;
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
			if (isFunctionParamWithMeta(p)) {
				const type = p.type ?? '*';
				const typeAnnotation = type === '*' ? '' : ` <${type}>`;
				return `${p.name}${typeAnnotation}`;
			}
			if (isToken(p)) {
				const type = p.type ?? '*';
				const typeAnnotation = type === '*' ? '' : ` <${type}>`;
				return `${p.name}${typeAnnotation}` as CalcInterpolation;
			}
			return p;
		})
		.join(', ');
	return `(${list})`;
}

// since params are not prefixed like tokens, this just uses the standard
// '--' as a prefix and can be instantiated globally.
const createParamToken = createTokenFactory({ tokenPrefix: '--' });
export function paramsAsInterpolations<TParams extends FunctionParams>(
	params: TParams,
): ParamsAsInterpolations<TParams> {
	return params.map((p) => {
		if (isToken(p)) {
			return css`
				${p}
			`;
		}
		if (isFunctionParamWithMeta(p)) {
			// convert to inline token so a value can be resolved
			// during computation later
			const asToken = createParamToken(p.name.replace('--', ''), {
				type: p.type,
			});
			if (p.fallback) {
				return css`
					${[asToken, p.fallback]}
				`;
			}
			return css`
				${asToken}
			`;
		}
		if (p.startsWith('--')) {
			const asToken = createParamToken(p.replace('--', ''), {});
			return css`
				${asToken}
			`;
		}
		return css`
			${p}
		`;
	}) as ParamsAsInterpolations<TParams>;
}

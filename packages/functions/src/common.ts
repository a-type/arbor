import { css, Css, CssInterpolation } from '@arbor-css/css-eval';
import {
	createTokenFactory,
	isToken,
	PropertyType,
	Token,
} from '@arbor-css/tokens';

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
	[K in keyof TParams]: CssInterpolation;
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
	: never]: CssInterpolation;
} & {
	[K in keyof TParams as TParams[K] extends (
		{ name: CssProperty; fallback: string }
	) ?
		TParams[K]['name']
	:	never]?: CssInterpolation;
};

export function isFunctionParamWithMeta(
	param: CssProperty | FunctionParamWithMeta,
): param is FunctionParamWithMeta {
	return typeof param === 'object' && 'name' in param;
}

export function paramsAsString<TParams extends FunctionParams>(
	params: TParams,
	{
		keepEmpty,
		nonce,
	}: {
		keepEmpty?: boolean;
		nonce?: string;
	},
): string {
	if (!params.length) {
		return keepEmpty ? '()' : '';
	}
	const list = params
		.map((p) => {
			const name = nonce ? paramAsToken(p, nonce).name : getParamName(p);
			if (isFunctionParamWithMeta(p)) {
				const type = p.type ?? '*';
				const typeAnnotation = type === '*' ? '' : ` <${type}>`;
				return `${name}${typeAnnotation}`;
			}
			if (isToken(p)) {
				const type = p.type ?? '*';
				const typeAnnotation = type === '*' ? '' : ` <${type}>`;
				return `${name}${typeAnnotation}` as CssInterpolation;
			}
			return name;
		})
		.join(', ');
	return `(${list})`;
}

export function getParamName(param: FunctionParam): string {
	if (isFunctionParamWithMeta(param)) {
		return param.name;
	}
	if (isToken(param)) {
		return param.name;
	}
	return param;
}

export function paramAsToken(param: FunctionParam, nonce: string): Token {
	const createParamToken = createTokenFactory({
		tokenPrefix: `--_-param-${nonce}-`,
	});
	if (isToken(param)) {
		return param.prefixed(`--_-param-${nonce}-`);
	}
	if (isFunctionParamWithMeta(param)) {
		return createParamToken(param.name.replace('--', ''), {
			type: param.type,
			description: param.description,
		});
	}
	return createParamToken(param.replace('--', ''), {});
}

export function paramsAsInterpolations<TParams extends FunctionParams>(
	params: TParams,
	nonce: string,
): ParamsAsInterpolations<TParams> {
	return params.map((p) => {
		const asToken = paramAsToken(p, nonce);
		if (isFunctionParamWithMeta(p) && p.fallback) {
			return css`
				${[asToken, p.fallback]}
			`;
		}
		return css`
			${asToken}
		`;
	}) as ParamsAsInterpolations<TParams>;
}

export function applyParameters(
	params: FunctionParams,
	inputs: Record<string, string>,
	nonce: string,
	apply: (name: string, value: Css) => void,
) {
	for (const param of params) {
		const name = getParamName(param);
		const asToken = paramAsToken(param, nonce);
		const fallback =
			isFunctionParamWithMeta(param) && param.fallback ?
				param.fallback
			:	undefined;
		const inputValue = inputs[name] ?? fallback;
		if (inputValue) {
			apply(
				asToken.name,
				css`
					${inputValue}
				`,
			);
		}
	}
}

import { DEFAULT_MIXIN_TOKEN_PREFIX } from '@arbor-css/tokens';
import {
	DEFAULT_FUNCTION_NAME_PREFIX,
	DEFAULT_MIXIN_NAME_PREFIX,
} from '@arbor-css/functions';

export interface ArborPrefixConfig {
	modeTokenPrefix?: string;
	primitiveTokenPrefix?: string;
	metaTokenPrefix?: string;
	refTokenPrefix?: string;
	functionNamePrefix?: string;
	mixinNamePrefix?: string;
	mixinTokenPrefix?: string;
}

export interface ArborResolvedPrefixes {
	modeTokenPrefix: string;
	primitiveTokenPrefix: string;
	metaTokenPrefix: string;
	refTokenPrefix: string;
	functionNamePrefix: string;
	mixinNamePrefix: string;
	mixinTokenPrefix: string;
}

export const DEFAULT_MODE_TOKEN_PREFIX = '--m-';
export const DEFAULT_PRIMITIVE_TOKEN_PREFIX = '--p-';
export const DEFAULT_META_TOKEN_PREFIX = '--_-';
export const DEFAULT_REF_TOKEN_PREFIX = '--ref-';

export function resolveArborPrefixes(
	config: ArborPrefixConfig = {},
): ArborResolvedPrefixes {
	return {
		modeTokenPrefix: config.modeTokenPrefix ?? DEFAULT_MODE_TOKEN_PREFIX,
		primitiveTokenPrefix:
			config.primitiveTokenPrefix ?? DEFAULT_PRIMITIVE_TOKEN_PREFIX,
		metaTokenPrefix: config.metaTokenPrefix ?? DEFAULT_META_TOKEN_PREFIX,
		refTokenPrefix: config.refTokenPrefix ?? DEFAULT_REF_TOKEN_PREFIX,
		functionNamePrefix:
			config.functionNamePrefix ?? DEFAULT_FUNCTION_NAME_PREFIX,
		mixinNamePrefix: config.mixinNamePrefix ?? DEFAULT_MIXIN_NAME_PREFIX,
		mixinTokenPrefix: config.mixinTokenPrefix ?? DEFAULT_MIXIN_TOKEN_PREFIX,
	};
}

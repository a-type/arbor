import {
	CreateFunction,
	createFunctionFactory,
	CreateMixin,
	createMixinFactory,
} from '@arbor-css/functions';
import { CreateToken, createTokenFactory } from '@arbor-css/tokens';
import { resolveArborPrefixes, type ArborPrefixConfig } from './prefixes.js';
import { createSystemProps, SystemTokens } from './systemProps.js';

export interface GlobalContextConfig extends ArborPrefixConfig {}

export interface GlobalContext {
	createModeToken: CreateToken;
	createMetaToken: CreateToken;
	createMixinToken: CreateToken;
	createToken: CreateToken;
	createFunction: CreateFunction;
	createMixin: CreateMixin;
	tokenPrefixes: ReturnType<typeof resolveArborPrefixes>;
	$systemTokens: SystemTokens;
}

export function createGlobalContext(config: GlobalContextConfig = {}) {
	const tokenPrefixes = resolveArborPrefixes(config);
	const createModeToken = createTokenFactory({
		tokenPrefix: tokenPrefixes.modeTokenPrefix,
	});
	const createMetaToken = createTokenFactory({
		tokenPrefix: tokenPrefixes.metaTokenPrefix,
	});
	const createMixinToken = createTokenFactory({
		tokenPrefix: tokenPrefixes.mixinTokenPrefix,
	});
	const $systemTokens = createSystemProps({
		createMetaToken,
	});

	return {
		createModeToken,
		createMetaToken,
		createMixinToken,
		createToken: createModeToken,
		createFunction: createFunctionFactory({
			namePrefix: tokenPrefixes.functionNamePrefix,
		}),
		createMixin: createMixinFactory({
			namePrefix: tokenPrefixes.mixinNamePrefix,
			createToken: createMixinToken,
		}),
		tokenPrefixes,
		$systemTokens,
	};
}

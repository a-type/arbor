import {
	CreateFunction,
	createFunctionFactory,
	CreateMixin,
	createMixinFactory,
} from '@arbor-css/functions';
import { CreateToken, createTokenFactory } from '@arbor-css/tokens';
import { defaultGlobals, GlobalConfig } from './globalProps.js';
import { resolveArborPrefixes, type ArborPrefixConfig } from './prefixes.js';
import { createSystemProps, SystemTokens } from './systemProps.js';

export interface GlobalContextConfig extends ArborPrefixConfig {
	globals?: Partial<GlobalConfig>;
}

export interface GlobalContext {
	createModeToken: CreateToken;
	createMetaToken: CreateToken;
	createMixinToken: CreateToken;
	createToken: CreateToken;
	createFunction: CreateFunction;
	createMixin: CreateMixin;
	tokenPrefixes: ReturnType<typeof resolveArborPrefixes>;
	globals: GlobalConfig;
	$systemTokens: SystemTokens;
	getGlobalPropertyAssignments(): Record<string, string>;
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
	const globals = {
		...defaultGlobals,
		...config.globals,
	};
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
		globals,
		getGlobalPropertyAssignments() {
			const assignments: Record<string, string> = {};
			let key: keyof GlobalConfig;
			for (key of Object.keys($systemTokens.global) as (keyof GlobalConfig)[]) {
				const token = $systemTokens.global[key];
				assignments[token.name] = globals[key].toString();
			}
			return assignments;
		},
	};
}

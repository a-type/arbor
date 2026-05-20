import { CreateFunction, createFunctionFactory } from '@arbor-css/functions';
import { CreateMixin, createMixinFactory } from '@arbor-css/mixins';
import {
	CreateToken,
	createTokenFactory,
	DEFAULT_TOKEN_PREFIX,
} from '@arbor-css/tokens';
import { defaultGlobals, GlobalConfig } from './globalProps.js';
import { createSystemProps, SystemTokens } from './systemProps.js';

export interface GlobalContextConfig {
	tokenPrefix?: string;
	globals?: Partial<GlobalConfig>;
}

export interface GlobalContext {
	createToken: CreateToken;
	createFunction: CreateFunction;
	createMixin: CreateMixin;
	tokenPrefix: string;
	globals: GlobalConfig;
	$systemTokens: SystemTokens;
	getGlobalPropertyAssignments(): Record<string, string>;
}

export function createGlobalContext(config: GlobalContextConfig = {}) {
	const tokenPrefix = config.tokenPrefix ?? DEFAULT_TOKEN_PREFIX;
	const createToken = createTokenFactory({ tokenPrefix });
	const $systemTokens = createSystemProps({ createToken });
	const globals = {
		...defaultGlobals,
		...config.globals,
	};
	return {
		createFunction: createFunctionFactory({ tokenPrefix }),
		createMixin: createMixinFactory({ tokenPrefix }),
		createToken,
		tokenPrefix,
		$systemTokens,
		globals,
		getGlobalPropertyAssignments() {
			const assignments: Record<string, string> = {};
			let key: keyof GlobalConfig;
			for (key of Object.keys(
				$systemTokens.globals,
			) as (keyof GlobalConfig)[]) {
				const token = $systemTokens.globals[key];
				assignments[token.name] = globals[key].toString();
			}
			return assignments;
		},
	};
}

import { CreateFunction, createFunctionFactory } from '@arbor-css/functions';
import {
	CreateToken,
	createTokenFactory,
	DEFAULT_TOKEN_PREFIX,
} from '@arbor-css/tokens';
import { createSystemProps, SystemTokens } from './systemProps.js';

export interface GlobalContextConfig {
	tokenPrefix?: string;
}

export interface GlobalContext {
	createToken: CreateToken;
	createFunction: CreateFunction;
	tokenPrefix: string;
	$systemTokens: SystemTokens;
}

export function createGlobalContext(config: GlobalContextConfig = {}) {
	const tokenPrefix = config.tokenPrefix ?? DEFAULT_TOKEN_PREFIX;
	const createToken = createTokenFactory({ tokenPrefix });
	return {
		createFunction: createFunctionFactory({ tokenPrefix }),
		createToken,
		tokenPrefix,
		$systemTokens: createSystemProps({
			createToken,
		}),
	};
}

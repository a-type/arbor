import init, {
	transform as transformNative,
} from 'https://esm.sh/lightningcss-wasm@1.32.0';
import {
	createSimplifier,
	CssSimplificationOptions,
	CssSimplifier,
} from './simplification.js';

export const loadSimplifier = async (
	options?: CssSimplificationOptions,
): Promise<CssSimplifier> => {
	await init();
	return createSimplifier({ transform: transformNative as any, options });
};

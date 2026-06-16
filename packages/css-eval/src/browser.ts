import init, {
	transform as transformNative,
} from 'https://esm.run/lightningcss-wasm';
import { createSimplifier, CssSimplifier } from './simplification.js';

export const loadSimplifier = async (): Promise<CssSimplifier> => {
	await init();
	return createSimplifier({ transform: transformNative as any });
};

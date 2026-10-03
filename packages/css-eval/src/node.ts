import { transform as transformNative } from 'lightningcss';
import { createSimplifier } from './simplification.js';

export const simplifier = createSimplifier({
	transform: transformNative,
	options: { passes: 2 },
});

export { createSimplifier };
export const transform = transformNative;

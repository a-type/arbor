import { transform as transformNative } from 'lightningcss';
import { createSimplifier } from './simplification.js';

export const simplifier = createSimplifier({
	transform: transformNative,
	options: { passes: 1 },
});

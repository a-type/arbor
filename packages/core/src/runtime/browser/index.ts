import { makeResolveRuntimeValue } from '../resolveRuntimeValue.js';
export * from '../registration.js';

import { loadSimplifier } from './simplifier.js';
export const resolveRuntimeValue = makeResolveRuntimeValue(loadSimplifier);

export { loadSimplifier };

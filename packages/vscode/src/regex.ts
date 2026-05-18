import { TOKEN_PREFIX } from '@arbor-css/core';

const TOKEN_PREFIX_RE = new RegExp(
	TOKEN_PREFIX.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
	'g',
);
export const TOKEN_RE_END = () =>
	new RegExp(`(${TOKEN_PREFIX}([\\w-]+)?)$`, 'g');
export const TOKEN_RE_ANYWHERE = () =>
	new RegExp(`(${TOKEN_PREFIX}([\\w-]+)?)`, 'g');

/** Matches an OKLCH color value */
export const OKLCH_RE = /^oklch\(/i;

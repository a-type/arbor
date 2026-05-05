import { VariantContext } from 'unocss';
import { Theme } from '../theme/types.js';

const reLetters = /[a-z]+/gi;
const resolvedBreakpoints = new WeakMap<
	any,
	{ point: string; size: string }[]
>();

export function resolveBreakpoints(
	{ theme, generator }: Readonly<VariantContext<Theme>>,
	key: 'breakpoint' | 'verticalBreakpoint' = 'breakpoint',
) {
	const breakpoints: Record<string, string> | undefined =
		(generator?.userConfig?.theme as any)?.[key] || theme[key];

	if (!breakpoints) return undefined;

	if (resolvedBreakpoints.has(theme)) return resolvedBreakpoints.get(theme);

	const resolved = Object.entries(breakpoints)
		.sort(
			(a, b) =>
				Number.parseInt(a[1].replace(reLetters, '')) -
				Number.parseInt(b[1].replace(reLetters, '')),
		)
		.map(([point, size]) => ({ point, size }));

	resolvedBreakpoints.set(theme, resolved);
	return resolved;
}

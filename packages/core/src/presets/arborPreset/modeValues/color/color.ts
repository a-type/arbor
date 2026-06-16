import {
	css,
	Css,
	CssResolutionContext,
	printCss,
	resolveCss,
} from '@arbor-css/css-eval';

export interface OklchCssRepresentation {
	l: Css;
	c: Css;
	h: Css;
	from?: Css;
	compiled: Css;

	/**
	 * Prints the CSS value of the color equation, including all
	 * calculations and variable references - fully dynamic.
	 */
	printDynamic(context: CssResolutionContext): string;
	/**
	 * Uses the equation and provided context to compute a static
	 * OKLCH color string with calculations and references resolved.
	 */
	printComputed(context: CssResolutionContext): string;
}

export function oklchBuilder(
	impl: () => {
		from?: Css;
		l: Css;
		c: Css;
		h: Css;
	},
): OklchCssRepresentation {
	const equations = impl();

	const compiled = css`oklch(${
		equations.from ? `from ${equations.from} ` : ''
	}calc(${equations.l}) calc(${equations.c}) calc(${equations.h}))`;

	return {
		...equations,
		compiled: css`oklch(${
			equations.from ? `from ${equations.from} ` : ''
		}calc(${equations.l}) calc(${equations.c}) calc(${equations.h}))`,
		printDynamic(): string {
			return printCss(compiled);
		},
		printComputed(context: CssResolutionContext): string {
			return resolveCss(compiled, context);
		},
	};
}

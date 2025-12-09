import { Theme } from '@unocss/preset-mini';
import { entriesToCss, PreflightContext, toArray } from 'unocss';
import { PROPS } from '../constants/properties';
import { preflight } from './_util';

export const propertiesPreflight = preflight({
	getCSS: (ctx: PreflightContext<Theme>) => {
		if (ctx.theme.preflightBase) {
			let css = entriesToCss(Object.entries(ctx.theme.preflightBase));

			css += `
@property ${PROPS.GROUP.MARGIN.FINAL} {
	syntax: "*";
	inherits: true;
	initial-value: 0;
}
@property ${PROPS.GROUP.PADDING.FINAL} {
	syntax: "*";
	inherits: true;
	initial-value: 0;
}
@property ${PROPS.GROUP.RADIUS.FINAL} {
	syntax: "*";
	inherits: true;
	initial-value: 0;
}
@property ${PROPS.GROUP.MARGIN.ODD} {
	syntax: "*";
	inherits: true;
	initial-value: 0;
}
@property ${PROPS.GROUP.MARGIN.EVEN} {
	syntax: "*";
	inherits: true;
	initial-value: 0;
}
@property ${PROPS.GROUP.PADDING.ODD} {
	syntax: "*";
	inherits: true;
	initial-value: 0;
}
@property ${PROPS.GROUP.PADDING.EVEN} {
	syntax: "*";
	inherits: true;
	initial-value: 0;
}
@property ${PROPS.GROUP.RADIUS.ODD} {
	syntax: "*";
	inherits: true;
	initial-value: 0;
}
@property ${PROPS.GROUP.RADIUS.EVEN} {
	syntax: "*";
	inherits: true;
	initial-value: 0;
}
@property ${PROPS.GROUP.DEPTH} {
	syntax: "<number>";
	inherits: true;
	initial-value: 0;
}
@property ${PROPS.GROUP.DEPTH_ODD} {
	syntax: "<number>";
	inherits: true;
	initial-value: 0;
}
@property ${PROPS.GROUP.DEPTH_EVEN} {
	syntax: "<number>";
	inherits: true;
	initial-value: 0;
}
@property ${PROPS.GROUP.EVEN_ODD} {
	syntax: "<number>";
	inherits: true;
	initial-value: -1;
}
`;
			const roots = toArray(
				ctx.theme.preflightRoot ?? ['*,::before,::after', '::backdrop'],
			);
			return roots
				.map((root) => `@layer preflightBase{${root}{${css}}}`)
				.join('');
		}
	},
});

import { Theme } from '@unocss/preset-mini';
import { PreflightContext } from 'unocss';
import { PROPS } from '../constants/properties';
import { VALUES } from '../constants/values';
import { preflight } from './_util';

function toSizeProperty(name: string, inherits: boolean) {
	return `@property ${name} {
	syntax: "<length>";
	inherits: ${inherits ? 'true' : 'false'};
	initial-value: 0px;
}
`;
}

function makeGroupProps(props: typeof PROPS.GROUP.EVEN) {
	return [
		`@property ${props.DEPTH} {
	syntax: "<number>";
	inherits: true;
	initial-value: 0;
}`,
		toSizeProperty(props.PADDING.LOCAL, true),
		toSizeProperty(props.PADDING.FINAL, true),
		toSizeProperty(props.MARGIN.LOCAL, true),
		toSizeProperty(props.MARGIN.FINAL, true),
		toSizeProperty(props.GAP.LOCAL, true),
		toSizeProperty(props.GAP.FINAL, true),
		toSizeProperty(props.RADIUS.LOCAL, true),
		toSizeProperty(props.RADIUS.FINAL, true),
		toSizeProperty(props.RADIUS.PARENT, true),
	].join('\n');
}

export const propertiesPreflight = preflight({
	getCSS: (ctx: PreflightContext<Theme>) => {
		return `
${makeGroupProps(PROPS.GROUP.EVEN)}
${makeGroupProps(PROPS.GROUP.ODD)}

@property ${PROPS.GROUP.DEPTH} {
	syntax: "<number>";
	inherits: true;
	initial-value: 0;
}
@property ${PROPS.GROUP.EVEN_ODD} {
	syntax: "<number>";
	inherits: true;
	initial-value: ${VALUES.GROUP.INITIAL};
}
`;
	},
});

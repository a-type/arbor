import { CLASSES } from '../constants/classes';
import { PROPS } from '../constants/properties';
import { preflight } from './_util';

export interface SpacingPreflightOptions {
	maxNestingDepth?: number;
}

export const spacingPreflight = ({
	maxNestingDepth = 10,
}: SpacingPreflightOptions) =>
	preflight({
		getCSS: async () => {
			return `
@property ${PROPS.GROUP.MARGIN} {
	syntax: "*";
	inherits: true;
}
@property ${PROPS.GROUP.PADDING} {
	syntax: "*";
	inherits: true;
}
@property ${PROPS.GROUP.RADIUS} {
	syntax: "*";
	inherits: true;
}
@property ${PROPS.GROUP.DEPTH} {
	syntax: "<number>";
	inherits: true;
	initial-value: 1;
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

.${CLASSES.GROUP} {
	${PROPS.GROUP.DEPTH}: max(var(${PROPS.GROUP.DEPTH_ODD}), var(${
				PROPS.GROUP.DEPTH_EVEN
			}));
}

${groupNestingSelector(1)}, .${CLASSES.GROUP_RESET} {
	${PROPS.GROUP.DEPTH_ODD}: 0;
	${PROPS.GROUP.DEPTH_EVEN}: 0;
}

${
	// odd nesting
	odds(3, maxNestingDepth).map(
		(depth) => `${groupNestingSelector(depth)} {
	${PROPS.GROUP.DEPTH_ODD}: calc(var(${PROPS.GROUP.DEPTH_EVEN}) + 1);
}`,
	)
}

${
	// even nesting
	evens(2, maxNestingDepth).map(
		(depth) => `${groupNestingSelector(depth)} {
	${PROPS.GROUP.DEPTH_EVEN}: calc(var(${PROPS.GROUP.DEPTH_ODD}) + 1);
}`,
	)
}
`;
		},
	});

/**
 * Creates a nested selector for groups which targets only the specified depth.
 * For example, a depth of 3 would produce the selector:
 * `.group .group .group:not(.group .group)`
 */
function groupNestingSelector(depth: number): string {
	const chained = Array(depth).fill(`.${CLASSES.GROUP}`).join(' ');
	return `${chained}:not(${chained} .${CLASSES.GROUP})`;
}

function odds(min: number, max: number): number[] {
	const result: number[] = [];
	for (let i = min; i <= max; i += 2) {
		result.push(i);
	}
	return result;
}

function evens(min: number, max: number): number[] {
	const result: number[] = [];
	for (let i = min; i <= max; i += 2) {
		result.push(i);
	}
	return result;
}

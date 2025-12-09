import { PROPS } from './properties';

export const SELECTORS = {
	GROUP_EVEN: `@container style(${PROPS.GROUP.EVEN_ODD}: 1)`,
	GROUP_ODD: `@container style(${PROPS.GROUP.EVEN_ODD}: 0)`,
	GROUP_INITIAL: `@container not style(${PROPS.GROUP.EVEN_ODD})`,
	WHERE: (selector: string) => `:where(${selector})`,
};

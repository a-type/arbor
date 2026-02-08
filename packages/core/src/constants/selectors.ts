import { CONTAINERS } from './containers';
import { PROPS } from './properties';
import { VALUES } from './values';

export const SELECTORS = {
	GROUP_EVEN: `@container ${CONTAINERS.GROUP} style(${PROPS.GROUP.EVEN_ODD}: ${VALUES.GROUP.ODD})`,
	GROUP_ODD: `@container ${CONTAINERS.GROUP} style(${PROPS.GROUP.EVEN_ODD}: ${VALUES.GROUP.EVEN})`,
	GROUP_INITIAL: `@container style(${PROPS.GROUP.EVEN_ODD}: ${VALUES.GROUP.INITIAL})`,
	WHERE: (selector: string) => `:where(${selector})`,
};

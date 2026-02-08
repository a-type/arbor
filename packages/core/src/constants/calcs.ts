import { PROPS } from './properties';
import { VALUES } from './values';

export const CALCS = {
	IF: (
		clauses: { if: string; is: string; value: string }[],
		elseValue: string,
	) => {
		const clauseStrings = clauses.map(
			(clause) => `style(${clause.if}:${clause.is}):${clause.value};`,
		);
		return `if(
			${clauseStrings.join('\n')}
			else:${elseValue};
		)`
			.replaceAll(/\n+/g, '')
			.replaceAll(/\t+/g, '');
	},
	MAX_0: (value: string) => `max(0px, ${value})`,
	GROUP: {
		SCALE: (mult = 1 / 2, pow = 1) =>
			`calc(pow(${mult},pow(var(${PROPS.GROUP.DEPTH},0),${pow})))`,
		NESTED_RADIUS: () =>
			CALCS.GROUP.EVEN_ODD(
				`calc(var(${PROPS.GROUP.EVEN.RADIUS}) - var(${PROPS.GROUP.EVEN.PADDING}) / 1.5)`,
				`calc(var(${PROPS.GROUP.ODD.RADIUS}) - var(${PROPS.GROUP.ODD.PADDING}) / 1.5)`,
				`var(${PROPS.GROUP.RADIUS_FALLBACK})`,
			),
		EVEN_ODD: (even: string, odd: string, none?: string) => {
			if (none !== undefined) {
				return CALCS.IF(
					[
						{
							if: PROPS.GROUP.EVEN_ODD,
							is: VALUES.GROUP.ODD,
							value: odd,
						},
						{
							if: PROPS.GROUP.EVEN_ODD,
							is: VALUES.GROUP.EVEN,
							value: even,
						},
					],
					none,
				);
			}
			return CALCS.IF(
				[
					{
						if: PROPS.GROUP.EVEN_ODD,
						is: VALUES.GROUP.ODD,
						value: odd,
					},
				],
				odd,
			);
		},
	},
};

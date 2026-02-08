import { RuleContext } from 'unocss';
import { PROPS } from '../constants/properties';
import { SELECTORS } from '../constants/selectors';

export function* groupRule(
	propGroup: 'MARGIN' | 'PADDING' | 'GAP' | 'RADIUS',
	assignTo:
		| string
		| string[]
		| {
				all: string | string[];
				even: string | string[];
				odd: string | string[];
				initial: string | string[];
		  },
	value:
		| string
		| ((
				values: typeof PROPS.GROUP.EVEN,
				opposites: typeof PROPS.GROUP.ODD,
		  ) => string),
	ctx: RuleContext,
	local: boolean,
): any {
	function wrappedValue(
		propGroup: typeof PROPS.GROUP.EVEN,
		opposite: typeof PROPS.GROUP.ODD,
	) {
		if (typeof value === 'function') {
			return value(propGroup, opposite);
		}
		return value;
	}

	const rawAlwaysAssignKeys =
		Array.isArray(assignTo) ? assignTo
		: typeof assignTo === 'object' ? assignTo.all
		: [assignTo];
	const alwaysAssignKeys =
		Array.isArray(rawAlwaysAssignKeys) ? rawAlwaysAssignKeys : (
			[rawAlwaysAssignKeys]
		);
	const evenAssignKeys =
		typeof assignTo === 'object' && 'even' in assignTo ?
			Array.isArray(assignTo.even) ?
				assignTo.even
			:	[assignTo.even]
		:	[];
	const oddAssignKeys =
		typeof assignTo === 'object' && 'odd' in assignTo ?
			Array.isArray(assignTo.odd) ?
				assignTo.odd
			:	[assignTo.odd]
		:	[];
	const initialAssignKeys =
		typeof assignTo === 'object' && 'initial' in assignTo ?
			Array.isArray(assignTo.initial) ?
				assignTo.initial
			:	[assignTo.initial]
		:	[];

	const oddValue = wrappedValue(PROPS.GROUP.ODD, PROPS.GROUP.EVEN);
	const evenValue = wrappedValue(PROPS.GROUP.EVEN, PROPS.GROUP.ODD);

	yield {
		[ctx.symbols.parent]: SELECTORS.GROUP_INITIAL,
		// assign inheritable custom prop
		[PROPS.GROUP.EVEN[propGroup].FINAL]: evenValue,
		[PROPS.GROUP.EVEN[propGroup].LOCAL]: local ? evenValue : undefined,
		// assign all CSS properties targeted
		...Object.fromEntries(alwaysAssignKeys.map((key) => [key, evenValue])),
		...Object.fromEntries(initialAssignKeys.map((key) => [key, evenValue])),
	};
	yield {
		[ctx.symbols.parent]: SELECTORS.GROUP_EVEN,
		[PROPS.GROUP.EVEN[propGroup].FINAL]: evenValue,
		[PROPS.GROUP.EVEN[propGroup].LOCAL]: local ? evenValue : undefined,
		...Object.fromEntries(alwaysAssignKeys.map((key) => [key, evenValue])),
		...Object.fromEntries(evenAssignKeys.map((key) => [key, evenValue])),
	};
	yield {
		[ctx.symbols.parent]: SELECTORS.GROUP_ODD,
		[PROPS.GROUP.ODD[propGroup].FINAL]: oddValue,
		[PROPS.GROUP.ODD[propGroup].LOCAL]: local ? oddValue : undefined,
		...Object.fromEntries(alwaysAssignKeys.map((key) => [key, oddValue])),
		...Object.fromEntries(oddAssignKeys.map((key) => [key, oddValue])),
	};
}

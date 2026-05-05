import { CSSEntry, CSSObject, DynamicRule, Rule } from 'unocss';
import { expect } from 'vitest';
import { testTheme as theme } from '../_test.js';
import { Theme } from '../theme/types.js';

type RuleResult = ReturnType<DynamicRule[1]>;

export async function testRules(
	rules: Rule<Theme>[],
	className: string,
	output: Record<string, string> | null,
) {
	let match: { rule: Rule<Theme>; result: RuleResult } | null = null;
	for (const rule of rules.toReversed()) {
		// only dynamic rules are supported
		if (typeof rule[0] === 'string' || typeof rule[1] !== 'function') {
			continue;
		}
		const [testInput, runRule] = rule;
		const extract = testInput.exec(className);
		if (!!extract) {
			const result = await runRule(extract!, { theme } as any);
			if (result) {
				match = { rule, result };
				break;
			}
		}
	}
	if (output === null) {
		expect(match, 'Expected no rules to match').toBeNull();
		return;
	}
	expect(match, 'No rules matched').not.toBeNull();
	expect(await coerceResult(match?.result)).toEqual(output);
}

async function coerceResult(result: RuleResult | CSSEntry): Promise<CSSObject> {
	if (result instanceof Promise) {
		return coerceResult(await result);
	}
	if (result === undefined) {
		return {};
	}
	if (typeof result === 'string') {
		throw new Error(`String results not supported yet`);
	}
	// handle generators
	if (Symbol.iterator in Object(result)) {
		const entries: Record<string, string> = {};
		for (const item of result as any) {
			Object.assign(entries, await coerceResult(item));
		}
		return entries;
	}
	if (Array.isArray(result)) {
		const entries: Record<string, string> = {};
		for (const item of result) {
			if (typeof item === 'number') {
				continue;
			}
			if (Array.isArray(item)) {
				continue;
			}
			Object.assign(entries, await coerceResult(item));
		}
		return entries;
	}
	return result as any;
}

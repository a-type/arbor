import { definePreset } from '@arbor-css/preset';
import { expect, it } from 'vitest';
import {
	findTokenRecord,
	findTokenSuggestions,
	formatTokenInfo,
	formatTokenList,
	listTokenRecords,
	parseTokenLevelFilter,
} from './introspection.js';

function createTestPreset() {
	return definePreset({
		name: 'test-preset',
		modeSchema: {
			spacing: {
				md: {
					purpose: 'spacing',
					description: 'Default medium spacing for layout rhythm.',
				},
			},
			color: {
				main: {
					$root: {
						purpose: 'color',
						description: 'Primary semantic color.',
					},
				},
			},
		},
		baseMode: () => ({
			spacing: {
				md: '16px',
			},
			color: {
				main: {
					$root: 'oklch(52% 0.22 260)',
				},
			},
		}),
	});
}

it('parses token level filters and supports aliases', () => {
	expect(parseTokenLevelFilter(undefined)).toEqual([
		'mode',
		'primitives',
		'system',
		'mixins',
	]);
	expect(parseTokenLevelFilter('primitives,mode')).toEqual([
		'primitives',
		'mode',
	]);
	expect(parseTokenLevelFilter('primitive,mixin')).toEqual([
		'primitives',
		'mixins',
	]);

	expect(() => parseTokenLevelFilter('invalid')).toThrow(
		'Invalid --filter level(s): invalid',
	);
});

it('lists token records and formats AI-friendly token table output', () => {
	const preset = createTestPreset();
	const modeSpacingTokenName = preset.$.mode.spacing.md.name;
	const modeMainColorTokenName = preset.$.mode.color.main.$root.name;
	const records = listTokenRecords(preset, {
		levels: ['mode'],
	});

	expect(
		records.some((record) => record.token.name === modeSpacingTokenName),
	).toBe(true);
	expect(
		records.some((record) => record.token.name === modeMainColorTokenName),
	).toBe(true);

	const output = formatTokenList(records);
	expect(output).toContain('name\tlevel\ttype\tpurpose\tgroup\tdescription');
	expect(output).toContain(modeSpacingTokenName);
	expect(output).toContain('Default medium spacing for layout rhythm.');
});

it('finds tokens by CSS variable name and returns name suggestions', () => {
	const preset = createTestPreset();
	const modeSpacingTokenName = preset.$.mode.spacing.md.name;
	const records = listTokenRecords(preset);
	const modeSpacingRecord = records.find(
		(record) => record.token.name === modeSpacingTokenName,
	);

	expect(modeSpacingRecord).toBeDefined();

	expect(findTokenRecord(records, modeSpacingRecord!.token.name)).toBe(
		modeSpacingRecord,
	);

	const infoOutput = formatTokenInfo(modeSpacingRecord!);
	expect(infoOutput).toContain(`name: ${modeSpacingRecord!.token.name}`);
	expect(infoOutput).toContain('purpose: spacing');
	const suggestions = findTokenSuggestions(records, modeSpacingTokenName.slice(0, -2));
	expect(suggestions.length).toBeGreaterThan(0);
	expect(suggestions[0]).toContain(modeSpacingTokenName);
});

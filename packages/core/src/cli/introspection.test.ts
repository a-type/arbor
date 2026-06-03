import { definePreset } from '@arbor-css/preset';
import { expect, it } from 'vitest';
import {
	findTokenRecord,
	findTokenSuggestions,
	formatFunctionList,
	formatMixinList,
	formatTokenInfo,
	formatTokenList,
	listFunctionRecords,
	listMixinRecords,
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
		functions: (create) => ({
			scale: create('scale', {
				description: 'Scales a value by a factor.',
				parameters: ['--value', '--factor'] as const,
				definition: ($, value, factor) => $`calc(${value} * ${factor})`,
			}),
		}),
		mixins: (create) => ({
			fg: create('fg', {
				description: 'Applies a foreground color.',
				parameters: ['--color'] as const,
				definition: ($, { parameters: [color] }) => ({
					color: $`${color}`,
				}),
			}),
		}),
	});
}

it('parses token level filters and supports aliases', () => {
	expect(parseTokenLevelFilter(undefined)).toEqual([
		'mode',
		'system',
		'mixins',
	]);
	expect(parseTokenLevelFilter('mode')).toEqual(['mode']);
	expect(parseTokenLevelFilter('mode,mixin')).toEqual(['mode', 'mixins']);

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
	const suggestions = findTokenSuggestions(
		records,
		modeSpacingTokenName.slice(0, -2),
	);
	expect(suggestions.length).toBeGreaterThan(0);
	expect(suggestions[0]).toContain(modeSpacingTokenName);
});

it('lists functions and mixins in AI-friendly table output', () => {
	const preset = createTestPreset();

	const functionRecords = listFunctionRecords(preset);
	expect(functionRecords).toHaveLength(1);
	expect(functionRecords[0].name).toContain('scale');

	const functionOutput = formatFunctionList(functionRecords);
	expect(functionOutput).toContain('name\tparameters\tdescription');
	expect(functionOutput).toContain('--value, --factor');
	expect(functionOutput).toContain('Scales a value by a factor.');

	const mixinRecords = listMixinRecords(preset);
	expect(mixinRecords).toHaveLength(1);
	expect(mixinRecords[0].name).toContain('fg');

	const mixinOutput = formatMixinList(mixinRecords);
	expect(mixinOutput).toContain('name\tparameters\tdeclarations\tdescription');
	expect(mixinOutput).toContain('--color');
	expect(mixinOutput).toContain('Applies a foreground color.');
});

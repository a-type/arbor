import {
	isFunctionParamWithMeta,
	type ArborFunction,
	type ArborMixin,
	type FunctionParam,
} from '@arbor-css/functions';
import type { AnyArborPreset } from '@arbor-css/preset/config';
import { isToken, type Token } from '@arbor-css/tokens';

export type TokenLevel = 'mode' | 'primitives' | 'system' | 'mixins';

export interface TokenRecord {
	level: TokenLevel;
	token: Token;
}

export interface FunctionRecord {
	name: string;
	fn: ArborFunction;
}

export interface MixinRecord {
	name: string;
	mixin: ArborMixin;
}

const DEFAULT_LEVELS: TokenLevel[] = ['mode', 'primitives', 'system', 'mixins'];

const LEVEL_ALIASES: Record<string, TokenLevel> = {
	mode: 'mode',
	primitives: 'primitives',
	primitive: 'primitives',
	system: 'system',
	mixins: 'mixins',
	mixin: 'mixins',
};

function walkTokenTree(
	node: any,
	level: TokenLevel,
	recordsByName: Map<string, TokenRecord>,
) {
	if (typeof node !== 'object' || node === null) {
		return;
	}

	for (const key of Object.keys(node)) {
		const value = node[key];

		if (isToken(value)) {
			recordsByName.set(value.name, {
				level,
				token: value,
			});
			continue;
		}

		if (typeof value === 'object' && value !== null) {
			walkTokenTree(value, level, recordsByName);
		}
	}
}

export function parseTokenLevelFilter(filter?: string): TokenLevel[] {
	if (!filter || filter.trim().length === 0) {
		return DEFAULT_LEVELS;
	}

	const parsed = filter
		.split(',')
		.map((value) => value.trim().toLowerCase())
		.filter((value) => value.length > 0);

	if (parsed.length === 0) {
		return DEFAULT_LEVELS;
	}

	const levels = new Set<TokenLevel>();
	const invalid = new Set<string>();
	for (const value of parsed) {
		const level = LEVEL_ALIASES[value];
		if (!level) {
			invalid.add(value);
			continue;
		}
		levels.add(level);
	}

	if (invalid.size > 0) {
		throw new Error(
			`Invalid --filter level(s): ${Array.from(invalid).join(', ')}. Valid levels: mode, primitives, system, mixins.`,
		);
	}

	return Array.from(levels);
}

export function listTokenRecords(
	preset: AnyArborPreset,
	{ levels = DEFAULT_LEVELS }: { levels?: TokenLevel[] } = {},
): TokenRecord[] {
	const enabledLevels = new Set(levels);
	const recordsByName = new Map<string, TokenRecord>();

	if (enabledLevels.has('mode')) {
		walkTokenTree(preset.$.mode, 'mode', recordsByName);
	}

	if (enabledLevels.has('primitives')) {
		walkTokenTree(preset.$.primitives, 'primitives', recordsByName);
	}

	if (enabledLevels.has('system')) {
		walkTokenTree(preset.$.system, 'system', recordsByName);
	}

	if (enabledLevels.has('mixins')) {
		walkTokenTree(preset.$.mixins, 'mixins', recordsByName);
	}

	return Array.from(recordsByName.values()).sort((a, b) =>
		a.token.name.localeCompare(b.token.name),
	);
}

function printable(value: unknown): string {
	if (value === undefined || value === null) {
		return '';
	}
	return String(value).replace(/[\t\r\n]+/g, ' ').trim();
}

function formatParam(param: FunctionParam): string {
	if (isToken(param)) {
		const type = printable(param.type);
		return type ? `${param.name}<${type}>` : param.name;
	}
	if (isFunctionParamWithMeta(param)) {
		const typeSuffix = param.type ? `<${param.type}>` : '';
		const fallbackSuffix = param.fallback ? `=${param.fallback}` : '';
		return `${param.name}${typeSuffix}${fallbackSuffix}`;
	}
	return param;
}

function formatParams(params: readonly FunctionParam[]): string {
	if (params.length === 0) {
		return '(none)';
	}
	return params.map((param) => formatParam(param)).join(', ');
}

export function formatTokenList(records: TokenRecord[]): string {
	const header = 'name\tlevel\ttype\tpurpose\tgroup\tdescription';
	const rows = records.map((record) => {
		const { token } = record;
		return [
			token.name,
			record.level,
			printable(token.type),
			printable(token.purpose),
			printable(token.group),
			printable(token.description),
		].join('\t');
	});

	return [header, ...rows].join('\n');
}

export function findTokenRecord(
	records: TokenRecord[],
	query: string,
): TokenRecord | undefined {
	const normalized = query.trim();
	if (normalized.length === 0) {
		return undefined;
	}

	return records.find((record) => record.token.name === normalized);
}

export function findTokenSuggestions(
	records: TokenRecord[],
	query: string,
	limit = 10,
): string[] {
	const normalized = query.trim().toLowerCase();
	if (normalized.length === 0) {
		return [];
	}

	return records
		.filter((record) => record.token.name.toLowerCase().includes(normalized))
		.slice(0, limit)
		.map((record) => record.token.name);
}

export function formatTokenInfo(record: TokenRecord): string {
	const { token } = record;
	const lines = [
		`name: ${token.name}`,
		`level: ${record.level}`,
		`type: ${printable(token.type)}`,
		`purpose: ${printable(token.purpose)}`,
		`group: ${printable(token.group) || '(none)'}`,
		`description: ${printable(token.description) || '(none)'}`,
		`fallback: ${printable(token.fallback) || '(none)'}`,
		`tag: ${printable(token.tag) || '(none)'}`,
		`contributedBy: ${printable(token.contributedBy) || '(none)'}`,
		`var: ${token.var}`,
	];

	return lines.join('\n');
}

export function listFunctionRecords(preset: AnyArborPreset): FunctionRecord[] {
	return Object.values(preset.functions)
		.map((fn) => ({
			name: fn.name,
			fn,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export function formatFunctionList(records: FunctionRecord[]): string {
	const header = 'name\tparameters\tdescription';
	const rows = records.map((record) =>
		[
			record.name,
			formatParams(record.fn.parameters),
			printable(record.fn.description),
		].join('\t'),
	);

	return [header, ...rows].join('\n');
}

export function listMixinRecords(preset: AnyArborPreset): MixinRecord[] {
	return Object.values(preset.mixins)
		.map((mixin) => ({
			name: mixin.name,
			mixin,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export function formatMixinList(records: MixinRecord[]): string {
	const header = 'name\tparameters\tdeclarations\tdescription';
	const rows = records.map((record) =>
		[
			record.name,
			formatParams(record.mixin.parameters),
			record.mixin.declarations.length,
			printable(record.mixin.description),
		].join('\t'),
	);

	return [header, ...rows].join('\n');
}

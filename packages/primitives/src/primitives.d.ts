import { ColorRangeItem, CompiledColors } from '@arbor-css/colors';
import { GlobalConfig } from '@arbor-css/globals';
import { CompiledShadows } from '@arbor-css/shadows';
import { CompiledSpacing } from '@arbor-css/spacing';
import { Token, TokenSchema } from '@arbor-css/tokens';
import { CompiledTypography } from '@arbor-css/typography';
export declare const defaultDefaultScheme = "light";
export interface PrimitivesConfig<TCompiledColors extends CompiledColors<any, any>, TCompiledTypography extends CompiledTypography<any>, TCompiledSpacing extends CompiledSpacing<any>, TCompiledShadows extends CompiledShadows<any>, TOtherTokens extends TokenSchema = TokenSchema> {
    colors: TCompiledColors;
    typography: TCompiledTypography;
    spacing: TCompiledSpacing;
    shadows: TCompiledShadows;
    misc?: TOtherTokens;
    defaultScheme?: keyof TCompiledColors;
    schemeTags?: Record<string, string>;
    globals?: Partial<GlobalConfig>;
}
type LiteralsToTokens<T extends Record<string, any>> = {
    [K in keyof T]: T[K] extends string | number ? Token : T[K] extends Record<string, any> ? LiteralsToTokens<T[K]> : never;
};
export interface PrimitivesColorScheme {
    [Color: string]: ColorRangeItem[];
}
export type Primitives<TCompiledColors extends CompiledColors<any, any> = CompiledColors<any, any>, TCompiledTypography extends CompiledTypography = CompiledTypography, TCompiledSpacing extends CompiledSpacing = CompiledSpacing, TCompiledShadows extends CompiledShadows = CompiledShadows, TOtherTokens extends TokenSchema = TokenSchema> = {
    /**
     * A map of color values, keyed by scheme name.
     * Each entry is the same structure: a record of color name keys
     * and string values which represent CSS colors.
     */
    colors: TCompiledColors;
    typography: TCompiledTypography;
    spacing: TCompiledSpacing;
    shadows: TCompiledShadows;
    defaultScheme: keyof TCompiledColors;
    schemeTags: Record<string, string>;
    globals: GlobalConfig;
    $tokens: {
        colors: LiteralsToTokens<TCompiledColors[keyof TCompiledColors]['colors']>;
        typography: LiteralsToTokens<TCompiledTypography['levels']>;
        spacing: LiteralsToTokens<TCompiledSpacing['levels']>;
        shadows: LiteralsToTokens<TCompiledShadows['levels']>;
    } & TOtherTokens;
};
export declare function createPrimitives<TCompiledColors extends CompiledColors<any, any>, TCompiledTypography extends CompiledTypography, TCompiledSpacing extends CompiledSpacing, TCompiledShadows extends CompiledShadows, TOtherTokens extends TokenSchema>(config: PrimitivesConfig<TCompiledColors, TCompiledTypography, TCompiledSpacing, TCompiledShadows, TOtherTokens>): Primitives<TCompiledColors, TCompiledTypography, TCompiledSpacing, TCompiledShadows, TOtherTokens>;
export {};
//# sourceMappingURL=primitives.d.ts.map
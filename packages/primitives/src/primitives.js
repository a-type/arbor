import { defaultGlobals } from '@arbor-css/globals';
import { createToken } from '@arbor-css/tokens';
import { isTypographyLevel } from '@arbor-css/typography';
import { convertStructure } from '@arbor-css/util';
export const defaultDefaultScheme = 'light';
export function createPrimitives(config) {
    const { colors, defaultScheme, globals: userGlobals } = config;
    const arbitraryScheme = Object.values(colors)[0];
    if (!arbitraryScheme) {
        throw new Error('At least one color scheme must be defined in primitives');
    }
    // TODO: validate all scheme shapes are the same...
    const $colorProps = convertStructure(arbitraryScheme.colors, (item) => typeof item === 'string', (_, path) => createToken(path.join('-'), {
        type: 'color',
        purpose: 'color',
        group: path.slice(0, -1).join('-'),
        tag: '🎨',
    }));
    const $typographyProps = convertStructure(config.typography.levels, isTypographyLevel, (_, path) => ({
        size: createToken(`typography-${path.join('-')}-size`, {
            type: 'length',
            purpose: 'font-size',
            group: path.join('-'),
            tag: '🅰️',
        }),
        weight: createToken(`typography-${path.join('-')}-weight`, {
            type: '*',
            purpose: 'font-weight',
            group: path.join('-'),
            tag: '🅰️',
        }),
        lineHeight: createToken(`typography-${path.join('-')}-line-height`, {
            type: '*',
            purpose: 'line-height',
            group: path.join('-'),
            tag: '🅰️',
        }),
    }));
    const $spacingProps = convertStructure(config.spacing.levels, (value) => typeof value === 'string' || typeof value === 'number', (_, path) => createToken(`spacing-${path.join('-')}`, {
        type: 'length',
        purpose: 'spacing',
        tag: 's',
    }));
    const $shadowProps = convertStructure(config.shadows.levels, (value) => typeof value === 'string' || typeof value === 'number', (_, path) => createToken(`shadow-${path.join('-')}`, {
        type: '*',
        purpose: 'shadow',
        tag: '🌫️',
    }));
    const globals = {
        ...defaultGlobals,
        ...userGlobals,
    };
    const schemeTags = {
        light: '☀️',
        dark: '🌑',
        ...config.schemeTags,
    };
    return {
        defaultScheme: defaultScheme ?? defaultDefaultScheme,
        schemeTags,
        globals,
        colors,
        typography: config.typography,
        spacing: config.spacing,
        shadows: config.shadows,
        $tokens: {
            ...(config.misc ?? {}),
            colors: $colorProps,
            typography: $typographyProps,
            spacing: $spacingProps,
            shadows: $shadowProps,
        },
    };
}
//# sourceMappingURL=primitives.js.map
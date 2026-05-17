# Agent Instructions for Arbor CSS

**Arbor CSS** is a modular, TypeScript-first CSS framework, with optional CSS utility classes (Tailwind-like) built on UnoCSS. It provides type-safe design system primitives (colors, typography, spacing, shadows) with dynamic theming, mode switching, and zero-runtime overhead through compile-time rule generation.

## Background

The creator of Arbor CSS is a frontend web engineer who builds a lot of design systems. This project is a distillation of lessons learned for how to structure and build design system CSS with an emphasis on new techniques that reduce the total number of tokens required (tens, not thousands). The key innovation here is the idea of "modes," a term borrowed from the "Mise en Mode" design system methodology. Modes give more expressive power to designers without requiring them to define a new token for every possible permutation of component.

## Project Structure

```
arbor-css (pnpm monorepo)
├── packages/
│   ├── core/          # Main library where most concepts come together: create primitives, modes and generate CSS from them
│   ├── classes/       # Utility class system built on UnoCSS. Turns the config from `core` into on-demand utility classes.
│   ├── preset/        # The "Arbor preset" — a ready-to-use collection of primitives, schemes, and mode schema bundled together. Also re-exports everything needed to define an arbor.config.ts.
│   ├── primitives/    # Assembles compiled colors, typography, spacing, and shadows into a typed token tree used by `preset` and `core`
│   ├── plugin/        # Bundler plugin (Vite/Rollup/webpack via unplugin). Transforms `.arbor.css` files and resolves `$.token.path` references and `@import 'arbor:css'` to generated CSS at build time.
│   ├── vscode/        # VS Code extension. Provides syntax highlighting, token autocomplete, and hover previews for `.arbor.css` files.
│   ├── tokens/        # Design Token abstraction that captures intent/usage and can write to various CSS representations (name, var, property definition)
│   ├── modes/         # Defines Mode schemas
│   ├── globals/       # Defines common global user configuration
│   ├── calc/          # A subset implementation of CSS `calc` in TS, allowing "baking" of equations before CSS generation and sharing the same logic in both CSS and runtime
│   ├── colors/        # Generates primitive OKLCH color ranges, scheme projections of colors
│   ├── typography/    # Generates typography primitives
│   ├── spacing/       # Generates spacing scale primitives
│   ├── shadows/       # Generates shadow primitives
│   └── util/          # Shared tools for common low-level needs
└── docs/              # Astro documentation and homepage
```

## Development Commands

If you're working on a worktree, remember to install dependencies before trying to build or run tests.

| Command               | Purpose                                                |
| --------------------- | ------------------------------------------------------ |
| `pnpm i`              | Install dependencies                                   |
| `pnpm run dev`        | Start all dev servers (tsc -w + astro dev in parallel) |
| `pnpm run -r test`    | Run vitest in watch mode across all packages           |
| `pnpm run -r test:ci` | Run tests once (CI mode)                               |
| `pnpm build`          | Build all packages with TypeScript                     |

**Development servers**:

- Core demo: http://localhost:5173 (Vite) - See [packages/core/demo](packages/core/demo) - Visualizes output of core CSS generation
- Classes demo: http://localhost:5174 (Vite) - See [packages/classes/demo/](packages/classes/demo) - Debugging and demonstration of CSS utility classes
- Docs: http://localhost:3000+ (Astro) - See [docs/](docs) - Homepage for the project and documentation

## Key Architecture

### Concepts

Arbor has strong opinions about the organization of CSS tokens into several layers of usable abstractions.

#### Primitives

Primitive tokens are 1:1 named mappings to literal values, like OKCLH colors or pixel sizes. They form the basis of the system but are not directly used in user code. Providing names to values ensures they can be changed over time without downstream refactoring.

See: [packages/core](packages/core)

#### Schemes

Schemes are color configurations which project primitive color ramps into usable palettes for different color schemes like "light" and "dark." Although these are commonly referred to as "light mode," etc, in Arbor we call them "schemes."

See: [packages/colors](packages/colors) and [packages/core](packages/core)

#### Modes

Modes are configurable applications of primitive tokens (filtered through Schemes, if they are colors) designed for semantic clarity and direct use by developers in their UI. A mode maps generic primitive values to clear, purposeful names. Each Arbor system has a Mode Schema, which defines all possible semantic values and their purposes. For example, a Mode might feature "action.primary.bg" which determines the background color of a primary button, toggle switch, or checked checkbox.

We always begin with a "base mode" which implements the entire schema. This serves as the baseline for everything in the UI. Then, other "partial modes" are applied to individual sections which modify the semantic tokens for particular purposes.

A mode is not a collection of "component tokens," though. It is not that specific. It's still up to designers and developers to interpret the semantic intents of mode tokens into actual specific UI experiences. You usually don't have to update your mode schema to add a new type of component.

Modes have a wide variety of uses. Here are some examples:

- `danger`: Replaces the main colors with red hues across all semantic intents. Good for creating warning alerts or destructive buttons.
- `dense`: Increases a "density" token which affects spacing, font size, and other factors. A wrapper with this mode automatically makes things smaller and closer together, good for nested sections or high-information pages.
- `promotion`: Applies one-off eye-catching gradients or colors to draw the user's attention to a particular area, like an upsell banner or premium pricing card.

See: [packages/modes](packages/modes)

#### Preset

`preset` is the standard entry point for end-users defining an `arbor.config.ts`. It bundles the Arbor default mode schema, default color schemes (light/dark), and a `createArborPreset()` helper that accepts user configuration (color ranges, typography, spacing, shadows, modes) and returns a fully typed preset object consumed by `core`, `classes`, and `plugin`.

See: [packages/preset](packages/preset)

#### Bundler Plugin

`plugin` is a framework-agnostic bundler plugin built on [unplugin](https://github.com/unjs/unplugin), supporting Vite, Rollup, and webpack. It performs two transforms at build time:

1. **`.arbor.css` files** — resolves `$.token.path` shorthand references (e.g. `$.color.primary`) into their CSS `var(--arbor-...)` equivalents and injects any required system property declarations.
2. **Any CSS file with `@import 'arbor:css'`** — expands that import into the full generated Arbor stylesheet for the project.

The plugin walks upward from each file to find the nearest `arbor.config.ts` and caches the resolved token map per config file.

See: [packages/plugin](packages/plugin)

#### VS Code Extension

`vscode` is a VS Code extension (`arbor-css-vscode`) that adds IDE support for `.arbor.css` files:

- **Syntax highlighting** via a TextMate grammar (`.arbor.css` is treated as CSS with embedded `$.token.path` expressions)
- **Token autocomplete** — triggered on `.` inside `$` expressions, pulling completions from the project's `arbor.config.ts`
- **Hover previews** — shows the resolved CSS variable name and value for a token reference under the cursor

The extension loads the config using the same `jiti`-based loader as the bundler plugin.

See: [packages/vscode](packages/vscode)

### Dependency Flow

`classes` depends on `core` to define the global CSS tokens, primitives, modes, and other values needed to define util classes.

`core` depends on most other things: `tokens` to define and interpret design tokens, `globals` to declare what things a user can tweak, `modes` to declare what a mode is and how it becomes CSS and tokens, and `colors`, `shadows`, `typography`, `spacing` to generate primitives for the "arbor preset."

`preset` depends on `primitives`, `colors`, `typography`, `spacing`, `shadows`, `modes`, `globals`, and `tokens` — it is the high-level assembly point for a complete Arbor configuration.

`plugin` and `vscode` depend on `core` (and `preset` transitively) to load and interpret an `arbor.config.ts` at tooling time.

## Development Patterns

### Adding Utility Classes

Rules live in [packages/classes/src/rules/](packages/classes/src/rules). Each rule:

1. Matches a class name pattern (RegExp)
2. Extracts values from the class name
3. Resolves values from theme or literals
4. Returns CSS object

**Example structure** (`packages/classes/src/rules/border.ts`):

```typescript
import { Rule } from '@unocss/core';
import { themeOrLiteral } from '../_util';

export const borderRules: Rule<Theme>[] = [
	[
		/^border-color-(.+)$/,
		([, value], { theme }) => {
			const [cssValue] = themeOrLiteral(value, theme, { startFrom: 'colors' });
			return cssValue ? { 'border-color': cssValue } : undefined;
		},
	],
];
```

**Testing pattern** (see [packages/classes/src/rules/border.test.ts](packages/classes/src/rules/border.test.ts)):

```typescript
await testRules('border-color-primary', {
	'border-color': 'var(--arbor-color-primary)',
	[colorVar.name]: 'oklch(0.5 0.1 240)',
});
```

This matches the input utility class against all rules defined in the system and compares it to the expected output as a second parameter.

### Configuration & Theming

Configuration flows: globals → primitives → modes → UnoCSS preset.

See working example: [packages/classes/arbor.config.ts](packages/classes/arbor.config.ts)

**Key files**:

- [packages/modes/src/createModeSchema.ts](packages/modes/src/createModeSchema.ts) - Define token structure
- [packages/modes/src/modeToCss.ts](packages/modes/src/modeToCss.ts) - Convert mode values to CSS variables
- [packages/colors/src/index.ts](packages/colors/src/index.ts) - Color system (OKLCH ranges, schemes)

### Color System

Colors use **OKLCH** color space (perceptually uniform). Key patterns:

- `createColorRange()` - Generate shade ranges (paper, wash, light, mid, heavy, ink)
- `createScheme()` - Create light/dark scheme with auto-derived neutrals

See: [packages/colors/](packages/colors)

## Testing

- **Framework**: Vitest with browser support (Playwright)
- **Location**: `*.test.ts` files alongside source
- **Test utilities**: `testArbor`, `testBaseMode` in [packages/classes/src/\_test.ts](packages/classes/src/_test.ts)
- **Running tests**: `pnpm run -r test` (watch) or `pnpm run -r test:ci` (once)

## Conventions

### Naming

- **CSS properties** use emoji prefixes: `💲-` (system internals), `👟-` (runtime dynamic), `ℹ️-` (info), `🍂-` (css util class vars), etc
- **Token names** use lowercase kebab-case: `color-primary`, `spacing-xs`

### TypeScript

- Target: ES2022, ESNext modules
- Base config: [tsconfig.base.json](tsconfig.base.json)
- Generics: Heavy use of TypeScript generics for type safety

## Common Pitfalls

⚠️ **Watch mode**: Changes to config files don't auto-recompile UnoCSS. Restart dev servers if `arbor.config.ts` or `uno.config.ts` changes.

⚠️ **Modes and schemes**: "Mode" does not mean "light mode" or "dark mode." Those are "schemes." "Modes" are semantic applications of tokens in the UI. See the section on Modes in this document.

⚠️ **Workspace protocols**: Internal dependencies use `workspace:*`. Ensure `pnpm` is used (not npm).

⚠️ **Theme resolution**: Use `themeOrLiteral()` to handle both theme tokens and literal values correctly.

## Documentation to Reference

- **Architecture**: No dedicated ARCHITECTURE.md; see package READMEs for details
- **Examples**: [docs/src/components/](docs/src/components) - Live Astro components
- **Classes demo**: [packages/classes/demo/](packages/classes/demo) - Interactive testing app
- **Test examples**: [packages/classes/src/rules/](packages/classes/src/rules) - Extensive `.test.ts` files

## Quick Starts

**Add a new utility rule**:

1. Create `packages/classes/src/rules/yourfeature.ts`
2. Define rule matching pattern and CSS generation
3. Add tests in `yourfeature.test.ts`
4. Export from [packages/classes/src/rules/index.ts](packages/classes/src/rules/index.ts)

**Fix a CSS utility class issue**:

1. Update UnoCSS logic in [packages/classes/src](packages/classes/src)
2. Run `pnpm run demo` in `packages/classes` and check the generated CSS in demo app
3. Demo app runs on http://localhost:5174

## Process

- When working from a promt file, once the work is complete, clean up the prompt file and any other notes or comments that aren't relevant to the final state of the project.

## Environment

- **Node**: 22+
- **Package manager**: pnpm (workspace: protocol support)
- **TypeScript**: 5.x+
- **UnoCSS**: Latest from workspace catalog
- **Vitest**: Latest from workspace catalog

# Agent Instructions for Arbor CSS

**Arbor CSS** is a modular, TypeScript-first CSS framework for design systems. It provides type-safe design system primitives (colors, typography, spacing, shadows) with dynamic theming, mode switching, and zero-runtime overhead through compile-time rule generation.

## Background

The creator of Arbor CSS is a frontend web engineer who builds a lot of design systems. This project is a distillation of lessons learned for how to structure and build design system CSS with an emphasis on new techniques that reduce the total number of tokens required (tens, not thousands). The key innovation here is the idea of "modes," a term borrowed from the "Mise en Mode" design system methodology. Modes give more expressive power to designers without requiring them to define a new token for every possible permutation of component.

## Project Structure

```
arbor-css (pnpm monorepo)
├── packages/
│   ├── core/          # Main library where most concepts come together: create primitives, modes and generate CSS from them
│   ├── preset/        # The "Arbor preset" — a ready-to-use collection of primitives, schemes, and mode schema bundled together. Also re-exports everything needed to define an arbor.config.ts.
│   ├── postcss/        # PostCSS plugin. Applies CSS extensions for the color system and resolves `@import 'arbor:css'` to generated CSS at build time.
│   ├── vscode/        # VS Code extension. Provides syntax highlighting, token autocomplete, and hover previews for CSS files.
│   ├── tokens/        # Design Token abstraction that captures intent/usage and can write to various CSS representations (name, var, property definition)
│   ├── modes/         # Defines Mode schemas
│   ├── globals/       # Defines common global user configuration and token / function namespacing
│   ├── calc/          # A subset implementation of CSS `calc` in TS, allowing "baking" of equations before CSS generation and sharing the same logic in both CSS and runtime
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
- Docs: http://localhost:3000+ (Astro) - See [docs/](docs) - Homepage for the project and documentation

## Key Architecture

### Concepts

Arbor has strong opinions about the organization of CSS tokens into several layers of abstractions.

#### Primitives

Primitive tokens are 1:1 named mappings to literal values, like OKCLH colors or pixel sizes. They form the basis of the system but are not directly used in user code. Providing names to values ensures they can be changed over time without downstream refactoring.

See: [packages/core](packages/core)

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

`preset` is the standard entry point for end-users defining an `arbor.config.ts`. It bundles the mode schema, base mode implementation, functions, and mixins. Presets can inherit from others, allowing users to extend built-in presets with their own concepts.

See: [packages/preset](packages/preset)

#### Hybrid runtime / baked CSS system

In `packages/calc` you'll find a CSS parser which is able to interpolate Tokens intelligently into a user's CSS value. It can also "bake" property values known at build-time into an equation, simplifying it to reduce its size and complexity for the browser.

This CSS parser and preprocessor powers both the `functions` capabilities and the more advanced use of mode token assignment which allows full CSS `calc()`, color functions, etc.

CSS constructed with this parser tracks Token usage, which is vital for mode functionality. We allow a user to define a minimal set of token changes in a custom mode, but the actual written CSS must then re-declare all dependent token values for them to 'capture' the new user-supplied value of their dependencies.

#### PostCSS Plugin

`plugin` is a PostCSS plugin for existing CSS pipelines. It inlines function and mixin calls, allowing users to utilize this future syntax in CSS today.

The plugin looks for a single `arbor.config.ts` relative to the current working directory (where PostCSS is invoked) and caches the resolved preset.

See: [packages/postcss](packages/postcss)

#### VS Code Extension

`vscode` is a VS Code extension (`arbor-css-vscode`) that adds IDE support for `.arbor.css` files:

- **Token autocomplete** — Pulls completions for `--x-` (or user-configured prefixed) properties from the project's `arbor.config.ts`
- **Hover previews** — shows the resolved CSS variable name and value for a token reference under the cursor
- **Diagnostics** - detects invalid Arbor token names and surfaces errors

The extension loads the config using the same `jiti`-based loader as the bundler plugin.

See: [packages/vscode](packages/vscode)

## Development Patterns

### Configuration & Theming

Configuration flows: globals → primitives → modes

See working example: [playground/arbor.config.ts](playground/arbor.config.ts)

**Key files**:

- [packages/modes/src/createModeSchema.ts](packages/modes/src/createModeSchema.ts) - Define token structure
- [packages/modes/src/modeToCss.ts](packages/modes/src/modeToCss.ts) - Convert mode values to CSS variables
- [packages/colors/src/index.ts](packages/colors/src/index.ts) - Color system (OKLCH ranges, schemes)

## Coding practices

- State and decisions should live in one place. Avoid duplicating state and risking getting out of sync; derive dependent state from one source of truth as needed.
- Do not add needless comment documentation or sectioning. If you have some large groups of related functionalities in one file, split them into their own modules rather than delineating sections with comment blocks. Give functions and variables clear names and add JSDoc as needed for clarity.
- Avoid redundant computation and abstractions. Look out for logic flows where data is transformed from one representation, to another, and then back. Changes in representation should be meaningful.
- Don't bias too heavily to whatever approach was taken before; align the codebase to the current best idea of how the logic should work. For internal-use packages like `calc`, we don't have to worry too much about breaking changes. Prefer clarity to continuity.

## Testing

- **Framework**: Vitest with browser support (Playwright)
- **Location**: `*.test.ts` files alongside source
- **Test utilities**: `testArbor`, `testBaseMode` in [packages/classes/src/\_test.ts](packages/classes/src/_test.ts)
- **Running tests**: `pnpm run -r test` (watch) or `pnpm run -r test:ci` (once)

## TypeScript

- Target: ES2022, ESNext modules
- Base config: [tsconfig.base.json](tsconfig.base.json)
- Generics: Heavy use of TypeScript generics for type safety

## Process

- When working from a prompt file, once the work is complete, clean up the prompt file and any other notes or comments that aren't relevant to the final state of the project.

## Environment

- **Node**: 22+
- **Package manager**: pnpm (workspace: protocol support)
- **TypeScript**: 5.x+
- **Vitest**: Latest from workspace catalog

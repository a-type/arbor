---
layout: '../../layouts/Doc.astro'
---

# Getting Started

Let's get set up with a brand new Arbor styling system. Along the way, we'll cover what decisions you can make to influence your styles and the tools Arbor provides to make that easier.

## Create an `arbor.config.ts`

Start by putting an `arbor.config.ts` file in your workspace's root. This file will export your preset.

`preset-arbor` will set you up with Arbor's opinionated primitives and modes.

```ts
import { presetArbor } from '@arbor-css/core/preset-arbor';

export default presetArbor({
	color: {
		ranges: {
			brand: { hue: 80 },
		},
		mainColor: 'brand',
	},
});
```

You need at least one color range. It's recommended to name colors semantically, not by their literal color name. Color hues are OKLCH hue values.

Arbor will generate light and dark color ranges for you from this hue, and it will also create a matching tinted gray range called `$neutral` to go with them.

Out of the box, Arbor has some opinions about what the shades of these ranges should be. Here's what it calls them:

- `paper`: Nearly colorless, a neutral surface value
- `wash`: Enough to notice against paper, but still very light
- `light`: A clear hue which stands out, but doesn't demand attention.
- `mid`: Now this is our color! Great for primary eye-catchers.
- `heavy`: Has a good contrast with `paper`, a bit less attention-grabbing, moving toward 'borders and text' kind of space.
- `ink`: Paper's complement, this is a high-contrast value meant for text and other neutral foreground material.

This may not look like color palettes you've used before. Particularly the "heavy" nomenclature. Arbor uses these "brightness-neutral" terms because it maps these color values to both light and dark schemes using the same name. I chose names which I felt were more aligned to the user's perception of a value, not its proximity to white or black, so that "lighter" or "heavy" can mean a dark color in light scheme or a bright color in dark scheme without contradictions.

### Color schemes

The compiled color structure starts with color schemes. A color scheme (sometimes referred to as "mode", like "light mode" or "dark mode") is a context which defines the values of color tokens in practice according to a user's preference or your brand's identity (or both).

Arbor automatically generates both a light and dark scheme for your colors with `compileColors`. These can't be turned off (but can be overridden). You can actually define custom schemes, too, which manipulate your input color hues however you like to generate color ranges. For example, a "high contrast dark" scheme might deepen and darken the "heavy" values and desaturate the "light" ones. But we don't need to get into that yet.

## Spacing, typography, etc

Arbor has fewer opinions about other design tokens which aren't colors. It still provides some bootstrapping tools to help you get something good going quickly, but there's not as much to dig into here.

### Typography

Arbor's `createTypography` helper will give you some default text scales to work with.

```ts
presetArbor({
	typography: {
		// set min/max sizes for automatic scaling
		minSize: '12px',
		maxSize: '80px',
		levels: {
			// you can override the typography levels if you want
			md: {
				size: '16px',
				lineHeight: '1.5',
				weight: '400',
			},
			// ...
		},
	},
});
```

### Spacing

```ts
presetArbor({
	spacing: {
		levels: {
			lg: '2rem',
			// ....
		},
	},
});
```

### Shadows

TODO

### Easing

TODO

### Duration

TODO

## Modes

Now that we have our preset set up, it's time to get to the good part: modes.

Modes are the expressive layer of Arbor systems. They're how you map primitive tokens to most parts of your UI.

Modes are personal. You'll probably want to come up with your own schema. But we can begin with Arbor's built-in preset.

With a schema in hand, your job is now to decide on some modes which are represented in your design system. Not sure what that means? Here's some examples:

```ts
preset.bundleMode('danger', {
	colors: {
		main: preset.$.primitives.color.danger,
	},
});

preset.bundleMode('dense', {
	density: 1.5,
});
```

## Let's see it!

Wow, ok, we finally have an Arbor style system ready with our first mode.

If you're using a bundler like Vite, the fastest way to get a look at your style system is to import Arbor's runtime and drop its `<arbor-system-demo>` custom element in your HTML.

```ts
import { connect } from '@arbor-css/core/runtime';
import arbor from './arbor.ts';

const demo = document.createElement('arbor-system-demo');
document.body.appendChild(demo);
```

You should see a collection of color swatches and other bits showing what your system values do.

## Building for production

You probably don't want Arbor in your runtime code, though. You just want some CSS. So let's move away from the runtime demo and get set up for real.

### PostCSS

If you're using Vite or RSBuild, you already have PostCSS in your bundler. Just make a `postcss.config.mjs` file in your root and add Arbor's plugin:

```js
import { ArborPlugin } from '@arbor-css/postcss';

export default {
	plugins: [ArborPlugin()],
};
```

Now any CSS file you author can utilize Arbor tokens, functions, and mixins. Arbor's PostCSS plugin transpiles future CSS features like functions and mixins automatically for you.

### CLI

Arbor ships with a CLI via `@arbor-css/core` that can build your stylesheet, validate usage in CSS files, and inspect your project's resolved token model.

```bash
# list all tokens in an AI-friendly tab-separated table
pnpm exec arbor tokens list

# list all functions and mixins
pnpm exec arbor functions list
pnpm exec arbor mixins list

# only include specific levels
pnpm exec arbor tokens list --filter primitives
pnpm exec arbor tokens list --filter primitives,mode

# inspect one token by CSS variable name
pnpm exec arbor token info --m-spacing-md
```

The introspection list commands output tab-separated rows that are easy for humans and agents to parse. `tokens list` includes name, level, type, purpose, group, and description; `functions list` includes name, parameters, and description; `mixins list` includes name, parameters, declaration count, and description.

## Editor integration

Arbor has a VS Code plugin, and it's vital to getting the best experience. While Arbor is just CSS, the existence of a preset and mode schema means we can type-check and validate your CSS as you write, and suggest completions.

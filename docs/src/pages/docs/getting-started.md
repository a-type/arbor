---
layout: '../../layouts/Doc.astro'
---

# Getting Started

Let's get set up with a brand new Arbor styling system. Along the way, we'll cover what decisions you can make to influence your styles and the tools Arbor provides to make that easier.

## Setting some globals

Before we begin, we need a few global config values. You can tweak these later, but all the other tools utilize them to generate your system.

Let's just go with these for now:

```ts
import { createGlobals } from '@arbor-css/core';

const globals = createGlobals({
	baseFontSizePixels: 16,
	saturation: 0.5,
	roundness: 0.5,
});
```

## Choosing some colors

I don't know about you, but this is usually where I begin. Arbor cares about colors a lot, and a lot of its configuration revolves around them, but all we need to begin is a single OKLCH hue.

```ts
import { compileColors } from '@arbor-css/core';

const colors = compileColors({
	ranges: {
		primary: {
			hue: 158,
		},
	},
	globals,
});
```

Arbor will generate light and dark color ranges for you from this hue, and it will also create a matching tinted gray range called `$neutral` to go with them.

Out of the box, Arbor has some opinions about what the shades of these ranges should be. Here's what it calls them:

- `paper`: Nearly colorless, a neutral surface value
- `wash`: Enough to notice against paper, but still very light
- `lighter`: Getting into the "color" area. Low contrast with paper, but clearly meaningful.
- `light`: A clear hue which stands out, but doesn't demand attention.
- `mid`: Now this is our color! Great for primary eye-catchers.
- `heavy`: Has a good contrast with `paper`, a bit less attention-grabbing, moving toward 'borders and text' kind of space.
- `heavier`: Quite high contrast but still noticeably colorful, a good choice for foregrounds on bold surfaces.
- `ink`: Paper's complement, this is a high-contrast value meant for text and other neutral foreground material.

This may not look like color palettes you've used before. Particularly the "heavy" nomenclature. Arbor uses these "brightness-neutral" terms because it maps these color values to both light and dark schemes using the same name. I chose names which I felt were more aligned to the user's perception of a value, not its proximity to white or black, so that "lighter" or "heavy" can mean a dark color in light scheme or a bright color in dark scheme without contradictions.

This range and naming scheme are customizable by you, though.

### Color schemes

The compiled color structure starts with color schemes. A color scheme (sometimes referred to as "mode", like "light mode" or "dark mode") is a context which defines the values of color tokens in practice according to a user's preference or your brand's identity (or both).

Arbor automatically generates both a light and dark scheme for your colors with `compileColors`. These can't be turned off (but can be overridden). You can actually define custom schemes, too, which manipulate your input color hues however you like to generate color ranges. For example, a "high contrast dark" scheme might deepen and darken the "heavy" values and desaturate the "light" ones. But we don't need to get into that yet.

## Spacing, typography, etc

Arbor has fewer opinions about other design tokens which aren't colors. It still provides some bootstrapping tools to help you get something good going quickly, but there's not as much to dig into here.

### Typography

Arbor's `createTypography` helper will give you some default text scales to work with.

```ts
const typography = createTypography({
	globals,
});
```

There are more config options if you want to tweak things, but at a certain point you can just toss this helper aside and implement the `Typography` type yourself.

### Spacing

You can quickly whip up a spacing scale with the `createSpacing` helper. This creates a focused and opinionated scale of values. These are all expressed in pixels right now - Arbor will convert them to `rem` for you when you assemble everything together, using your `typography` values.

```ts
const spacing = createSpacing({
	globals,
});
```

## Constructing primitive tokens

Now that we have some colors, we can create a set of primitive tokens. This will be the heart of our design system, a single place for every primitive token reference used.

```ts
const primitives = createPrimitives({
	globals,
	colors, // from compiledColors
	spacing,
	typography,
	defaultScheme: 'light',
});
```

## Modes

Now that we have our primitives set up, it's time to get to the good part: modes.

Modes are the expressive layer of Arbor systems. They're how you map primitive tokens to most parts of your UI.

Modes are personal. You'll probably want to come up with your own schema. But we can begin with Arbor's built-in recommendation.

With a schema in hand, your job is now to fill it in to create your Base Mode. The Base is the only one that needs to specify _every_ property -- other modes can focus on things they care about.

This snippet ain't short, nor should it really be. These are some of the core expressive decisions you make in your design. Feel free to copy this as a starting point, but each value here is a distinct opportunity to make your mark!

```ts
import { arborModeSchema } from '@arbor-css/core';

const { $tokens } = primitives;

const baseMode = arborModeSchema.createBase({
	mainColor: $tokens.color.primary,
	neutralColor: $tokens.color.primary.$neutral,
	action: {
		primary: {
			bg: $tokens.color.primary.mid,
			fg: $tokens.color.primary.ink,
			border: $tokens.color.primary.heavy,
		},
		secondary: {
			bg: $tokens.color.primary.$neutral.lighter,
			fg: $tokens.color.primary.$neutral.ink,
			border: $tokens.color.primary.$neutral.heavy,
		},
		ambient: {
			bg: $tokens.color.primary.wash,
			fg: $tokens.color.primary.ink,
			border: 'transparent',
		}
	},
	surface: {
		primary: {
			bg: $tokens.color.primary.wash,
			fg: $tokens.color.primary.ink,
			border: 'transparent',
		},
		secondary: {
			bg: $tokens.color.primary.paper,
			fg: $tokens.color.primary.$neutral.ink,
			border: 'transparent',
		},
		ambient: {
			bg: $tokens.color.primary.$neutral.paper,
			fg: $tokens.color.primary.$neutral.ink,
			border: 'transparent',
		}
	},
	control: {
		bg: $tokens.color.primary.$neutral.paper,
		fg: $tokens.color.primary.$neutral.ink,
		border: $tokens.color.primary.$neutral.heavy,
	},
	text: {
		primary: {
			size: $tokens.typography.
		}
	}
});
```

> Want to add more tokens? You can `.extend` the `arborModeSchema`.

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

First, use the CLI to generate your CSS.

```sh
$ npx arbor -c arbor.ts
```

Point it to your `arbor.ts` file and optionally add `-o` to specify what the destination CSS file should be.

This will generate a single CSS file which contains your whole Arbor system: primitives, schemes, and modes.

Now, it's time to actually use it to style _your_ UI.

---
layout: '../../layouts/Doc.astro'
---

# Presets

Arbor uses composable presets to define your design system tokens, modes, functions, and mixins.

We ship two presets you can utilize to get going quickly: the "core" preset which includes primitive tokens but no modes, and an "Arbor" preset which adds our recommended mode schema and default base mode.

```ts
import { presetArbor } from '@arbor-css/core/preset-arbor';

const preset = presetArbor({
	color: {
		mainColor: 'brand',
		ranges: {
			brand: {
				hue: 158,
				saturation: 0.7,
			},
			accent: {
				hue: 40,
			},
			danger: {
				hue: 20,
			},
		},
	},
});
```

Using one of the built-in presets is an easy way to bootstrap a lot of decisions. You can also extend a preset and add more mode tokens, mixins, or functions.

```ts
import { presetArbor } from '@arbor-css/core/preset-arbor';

const preset = presetArbor({
	color: {
		mainColor: 'brand',
		ranges: {
			brand: {
				hue: 158,
				saturation: 0.7,
			},
		},
	},

	mixins: (create, $tokens) => ({
		dottedBorder: create('dashed-border', {
			definition: {
				'border-width': $tokens.mode.lineWidth,
				'border-style': 'dashed',
				'border-color': $tokens.mode.colors.main,
			},
		}),
	}),
});
```

> ⚠️ **Functions must come last**
> Due to the complexity of the typechecking on presets, always define your `functions` _after_ `mixins` in your preset config. This allows `functions` to access tokens contributed from the mixins you define, and not doing so produces a confusing type error on `mixins`.

## Extending other presets

The `extends` array in a `definePreset` config allows you to inherit lots of things from another preset. Your own config will be deeply merged to the preset(s) you extend. This includes mode schema, primitives, mixins, and functions.

```ts
import { presetArbor } from '@arbor-css/core/preset-arbor';

const preset = presetArbor({
	color: {
		mainColor: 'brand',
		ranges: {
			brand: {
				hue: 158,
				saturation: 0.7,
			},
		},
	},

	// Adds a new "favoriteColor" token onto the existing
	// presetArbor mode schema
	modeSchema: {
		favoriteColor: 'color',
	},
});
```

When extending a built-in mode, you must also supply default values for any tokens you add to the mode. See [modes](./modes) for how to specify a base mode from your preset.

## Making your own

To make your own preset, you'll need to define some tokens and rules. You can start from scratch, if you want. Here's what your preset can contain:

### Name

Give your preset a meaningful name. Not really used anywhere, just good housekeeping.

### Primitives

Arbor has a certain expected "theme" structure for primitive tokens, but within that structure you're free to define which token groups you want to use.

### Mode Schema

You must define a `modeSchema` which is the comprehensive structure which all modes inherit.

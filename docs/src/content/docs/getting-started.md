---
title: Getting Started
description: Get up and running with Arbor CSS
---

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

Arbor will generate light and dark color ranges for you from this hue, and it will also create a matching tinted gray range called `$neutral` to go with each one.

[Read more about Arbor's built-in preset here.](./arbor-preset)

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

In order to create modes, though, you need to know what tokens are available to play with! Typescript should already be giving you an idea, but [head over to the documentation for Arbor's built-in preset](./arbor-preset) to get the full picture.

Or, you can just copy one of those.

## Let's see it!

Wow, ok, we finally have an Arbor style system ready with our first mode.

If you're using a bundler like Vite, the fastest way to get a look at your style system is to import Arbor's runtime and drop its `<arbor-system-demo>` custom element in your HTML.

```ts
import { connect } from '@arbor-css/core/runtime';
import myPreset from './arbor.config.ts';

// turn on Arbor's runtime
connect(myPreset);

const demo = document.createElement('arbor-system-demo');
document.body.appendChild(demo);
```

If it worked, you'll see

## Building for production

You probably don't want Arbor in your runtime code, though. You just want some CSS. So let's move away from the runtime demo and get set up for real. Once you've done one of these, you can remove all Arbor code from your runtime app.

### PostCSS

If you're using Vite or RSBuild, you already have PostCSS in your bundler. Just make a `postcss.config.mjs` file in your root and add Arbor's plugin:

```js
import { ArborPlugin } from '@arbor-css/postcss';

export default {
	plugins: [ArborPlugin()],
};
```

Now any CSS file you author can utilize Arbor tokens, functions, and mixins. Arbor's PostCSS plugin transpiles future CSS features like functions and mixins automatically for you.

To bootstrap your preset's base styles and mode, you need to include some generated CSS in your app. Right now this is done with a 'magic comment.'

```
/* in your root CSS file, add: */

/* @import('arbor:css') */
```

Yes, I know this looks like a commented _out_ import. I'm having trouble getting PostCSS to replace this without first trying to actually import a file which doesn't exist, so it's a comment for now.

### CLI

You can also use Arbor's CLI to generate your base stylesheet. However, you won't be able to use 'future' CSS features like mixins and functions without PostCSS.

```
pnpm arbor build -o arbor-base.css
```

This will create a stylesheet you can drop on your page to define your base mode and any "bundled" modes for immediate use. Mode tokens are available as CSS custom properties and modes can be applied to elements with `@mode-<name>` classes.

## What's next

That's all you need to have a working Arbor setup which generates CSS from modes, defining the tokens you use to style everything else.

But there's plenty more to explore to help make the most out of Arbor as a tool and methodology!

### Editor integration

Arbor has a VS Code plugin, and it's vital to getting the best experience. While Arbor is just CSS, the existence of a preset and mode schema means we can type-check and validate your CSS as you write, and suggest completions with rich documentation drawn straight from your mode schema.

Arbor's extension also has a powerful CSS _resolver_, which automatically simplifies and processes token values to their most understandable form, no matter how complex their underlying rules are (well, most of the time!) This means you'll see color swatch previews of color tokens and pixel values for spacing and font sizes!

### Mixins and functions

We haven't even really _touched_ on mixins and functions, two powerful CSS proposals which Arbor makes available today. Arbor's built-in mode ships with lots of these, and they help make CSS feel even more powerful.

And of course, you can make your own.

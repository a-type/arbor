---
title: Basic preset
---

Arbor ships a "basic" preset which doesn't ship any actual design tokens, but lays some groundwork other presets may find useful.

# Features

## Light and dark mode logical properties

This preset contributes a couple properties which are synchronized to light and dark mode which you can use in calculations or CSS conditional logic.

| Token name         | Usage                                                                                                       | Example value              |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------- |
| `whenLight`        | Indicates that light mode is active                                                                         | `0`, `1`                   |
| `whenDark`         | Indicates that dark mode is active                                                                          | `0`, `1`                   |
| `whenInverted`     | Indicates a mode is applied which inverts the color scheme from the user's selection                        | `0`, `1`                   |
| `schemeMultiplier` | Gives a unit direction: positive for light, negative for dark.                                              | `1`, `-1`                  |
| `trueLightColor`   | Resolves to the 'lightest' color relative to the mode: in light mode, it's white; in dark mode, it's black. | `light-dark(white, black)` |
| `trueHeavyColor`   | Resolves to the 'heaviest' color relative to the mode: in light mode, it's black; in dark mode, it's white. | `light-dark(black, white)` |

## Color alteration functions

The basic preset provides a variety of color manipulation functions for tweaking colors.

- `--fn-color-lighter(<color>, <steps>)`: Increases the lightness of a color by a number of perceptual steps. In light mode, this makes it closer to white; in dark mode, it makes it closer to black.
- `--fn-color-heavier(<color>, <steps>)`: Increases the heaviness of a color by a number of perceptual steps. In light mode, this makes it closer to black; in dark mode, it makes it closer to white.
- `--fn-color-desaturated(<color>, <steps>)`: Decreases saturation of a color by a number of perceptual steps.
- `--fn-color-saturated(<color>, <steps>)`: Increases saturation of a color by a number of perceptual steps.
- `--fn-color-faded(<color>, <percentage>)`: Sets the opacity of a color to an exact percentage value.
- `--fn-color-between(<colorA>, <colorB>, <progress>)`: Interpolates two colors proportionally to the third parameter.

## Decorative functions

```
--fn-ring(<color>, <size>?, <offset>?)
```

This utility function generates a "ring" shadow from a color, plus optional size and offset.

## Math functions

```
--fn-between(<numA>, <numB>, <progress>)
```

Returns the interpolated value between the first two parameters, proportional to the third. This is equivalent to the upcoming CSS `progress` function.

## Color system mixins

The basic preset adds a collection of mixins which augment the use of colors to be more adaptive. In normal CSS, properties like `color` and `background-color` don't inherit (for good reason, of course). But while you have `currentColor` for `color`, there's (currently) no way to reference values from parents. And there's (again currently) no way at all to _derive_ a new value from a value applied on the current element. That's what Arbor's color system aims to let you do.

### Applying colors

Each color CSS property has a corresponding mixin to apply a value to that property. This is the equivalent of, e.g., `color: blue` -- but integrated in with the dynamic color system.

```css
@apply --mx-bg(green);
```

To understand why you'd want to use a mixin for a simple property assignment, here's what is actually output in the final CSS:

```css
--mx-bg-applied: green;
--mx-bg-final: green;
background-color: var(--mx-bg-final);
```

Perhaps you already see the utility here? Let's keep going.

### Deriving one value from another

The simplest thing you can do with this system is declare that one color property "mirrors" another:

```css
@apply --mx-borderColor(var(--mx-fg-applied));
```

Pass the applied value of one mixin to another, and you can be sure that when the first one changes, the second one follows.

Why do this over assigning the same value to both properties independently? Encoding this design decision this way makes adaptation easier for variants.

Consider:

```css
.btn-default {
	@apply --mx-fg(black);
	@apply --mx-borderColor(var(--mx-fg-applied));
}

.btn-blue {
	@apply --mx-fg(blue);
}
```

With this trick, changing the `fg` color automatically also changes the border color.

Whether you like this is up to you. It's just one thing you can do with the system.

### Applying modifications local or inherited values

Perhaps you noticed the inclusion of both `-applied` and `-final` properties. This is to enable the next trick: mixins which quickly make modifications to a property's color.

```css
@apply --mx-bg-lighter(1);
@apply --mx-fg-desaturated(2);
@apply --mx-borderColor-faded(40%);
```

These mixins automatically apply a color change to the color already applied to the target property by the `--mx-<propertyName>`.

Once again, this is convenient in simple cases, but becomes a useful composition tool if applied purposefully in variations.

```css
.btn.default {
	@apply --mx-bg(gray);
}
.btn.primary {
	@apply --mx-bg(blue);
}

.btn:disabled {
	@apply --mx-bg-faded(50%);
}
```

The use of a direct color modification mixin above for an element state allows the alteration to apply to any applied background, even outside the component's own CSS.

This is where the color system begins to reap benefits in terms of enforcing consistent design system rules across unexpected scenarios without requiring every instance to define CSS for every rule manually.

## Shadow mixins

The basic preset also includes mixins for defining and combining shadows and ring shadows.

```css
@apply --mx-shadow(<shadow>?);
@apply --mx-ring(<ring shadow>?);
```

While not very interesting on their own, they help solve the problem of layering a box shadow and a ring shadow from separate places without having to also resupply the original shadow.

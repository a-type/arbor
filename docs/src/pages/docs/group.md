---
layout: '../../layouts/Doc.astro'
---

# `@group`

Grouping is a core system in Arbor. Groups use CSS `container` features to establish automatic contextual design principles like:

- Proportional sizing of nested group spacing and gaps
- A (best effort) fitting of rounded corners within nested groups

These features are _systematic_, meaning the same styling configuration applied to an element will automatically adapt to parent grouping (including multiple levels of nesting) wherever that element is placed. Groups work together with componentization to deliver highly adaptive, reusable components with very little configuration on your end.

## Groups and components

When your reusable component is marked as a `@group`, you instantly get access to smart adaptive styling features. To avoid unexpected behavior, these features are opt-in via the `nest` util.

```
// adapt only padding to parent groups
nest-p
// adapt padding and roundeness to parent groups
nest-p/rd
// use all available nesting rules
nest-all
```

When `nest` util rules are applied, the element will adapt to parent `@group` values of the selected rules. If there is no nesting context, it will use normally configured rules instead.

```
// padding is large by default. padding will get smaller if nested.
p-lg nest-p
```

## Reset grouping

Want a component to act as a parent group, but ignore any parents of its own? You can do this by just not specifying any `nest` behavior.

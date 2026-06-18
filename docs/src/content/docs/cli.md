---
title: The CLI
---

Arbor ships with a CLI via `@arbor-css/core` that can build your stylesheet, validate usage in CSS files, and inspect your project's resolved token model.

```bash
# list all tokens in an AI-friendly tab-separated table
pnpm exec arbor tokens:list

# list all functions and mixins
pnpm exec arbor functions:list
pnpm exec arbor mixins:list

# only include specific levels
pnpm exec arbor tokens:list --filter primitives
pnpm exec arbor tokens:list --filter primitives,mode

# inspect one token by CSS variable name
pnpm exec arbor token:info --m-spacing-md
```

The introspection list commands output tab-separated rows that are easy for humans and agents to parse. `tokens:list` includes name, level, type, purpose, group, and description; `functions:list` includes name, parameters, and description; `mixins:list` includes name, parameters, declaration count, and description.

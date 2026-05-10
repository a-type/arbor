## Plan: Add $root Support to Mode Schema Paths

Add optional `$root` at any Mode Schema object level so it creates a token for that grouping path (for example, `colors.main.$root` -> `--Ⓜ️-colors-main`) without appending `-$root`. Implement this by updating schema traversal and mapped types in `createModeSchema.ts`, then add targeted tests that validate naming, value application, and coexistence with nested keys.

**Steps**

1. Define type-level behavior for `$root` in schema and value structures in `packages/modes/src/createModeSchema.ts`.
   Depends on: none.
   Details: Extend `ModeSchemaLevel` to allow optional `$root` property while preserving arbitrary nested keys; update `ModeValues<T>` and `AsPropertyDefinitions<T>` so `$root` is represented as a token/value leaf at that level and other keys continue to recurse normally.
2. Update schema-to-token traversal in `createModeTokens()` within `packages/modes/src/createModeSchema.ts`.
   Depends on: step 1.
   Details: In `generatePropsForSchemaLevel`, special-case key `$root` so token name uses current `propPrefix` (group path) instead of appending an extra segment; keep output shape as `propsLevel.$root`; continue supporting objects that include both `$root` and nested keys.
3. Verify token group metadata and flatten behavior remain consistent.
   Depends on: step 2.
   Details: Ensure `$root` token `group` remains the parent path (`propPrefix`) and that downstream flattening (`toFlatKeys`) produces matching key paths for values and tokens, enabling `modeToCss()` to map `values.<path>.$root` to `tokens.<path>.$root`.
4. Add focused tests for `$root` schema behavior in `packages/modes/src/modeToCss.test.ts`.
   Depends on: steps 1-3.
   Details: Add cases that assert:
   - `$root` at nested level generates expected CSS variable name without `-$root`.
   - `$root` and sibling nested keys coexist and both emit correctly.
   - Partial mode overrides with `$root` map correctly and do not break existing dependent-value behavior.
5. Add type-level regression checks (lightweight compile assertions) in existing modes tests or a new colocated test file under `packages/modes/src/`.
   Depends on: step 1.
   Details: Confirm TypeScript accepts `$root` in schema and value definitions and preserves expected inference for non-`$root` keys.
6. Run package tests for modes and then workspace CI tests as confidence allows.
   Depends on: steps 4-5.
   Parallelism: modes-only tests first; full suite after.

**Relevant files**

- `c:/Users/a-typ/git/arbor-css/packages/modes/src/createModeSchema.ts` — update `ModeSchemaLevel`, `ModeValues<T>`, `AsPropertyDefinitions<T>`, and `createModeTokens()` traversal.
- `c:/Users/a-typ/git/arbor-css/packages/modes/src/modeToCss.test.ts` — add runtime assertions for CSS var output with `$root`.
- `c:/Users/a-typ/git/arbor-css/packages/modes/src/modeToCss.ts` — likely no logic changes, but validate key-matching assumptions using `toFlatKeys`.
- `c:/Users/a-typ/git/arbor-css/packages/util/src/keys.ts` — reference-only validation of flatten semantics; modify only if `$root` matching reveals a defect.

**Verification**

1. Run: `pnpm --filter @arbor-css/modes test:ci` and confirm new `$root` tests pass.
2. Run: `pnpm run -r test:ci` (or at minimum `pnpm --filter @arbor-css/core test:ci` and `pnpm --filter @arbor-css/classes test:ci`) to verify no downstream regressions.
3. Add a temporary schema fixture (in tests) containing both `$root` and nested branches and verify emitted CSS contains expected names such as `--Ⓜ️-colors-main` and nested vars like `--Ⓜ️-colors-main-mid`.
4. Manually confirm existing snapshots in `modeToCss.test.ts` remain unchanged for schemas without `$root`.

**Decisions**

- Include: `$root` is optional at any object level, appears literally in `$tokens` and mode values shape, and coexists with nested keys.
- Include: naming rule is confirmed as path-only (no appended `-$root`).
- Exclude: introducing additional reserved keys beyond `$root` in this change.
- Exclude: changing token creation global escape behavior in `@arbor-css/tokens`; keep scope local to mode schema traversal and typing.

**Further Considerations**

1. If future reserved keys are needed (`$meta`, etc.), centralize a reserved-key helper in modes traversal rather than adding one-off key checks.
2. If `$root` becomes heavily used, add documentation/examples in preset docs to guide schema authors and avoid naming collisions in complex trees.

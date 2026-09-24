# Changelog

## 2.0.0-beta.0 (unpublished candidate)

- Rebuilt Natural-JS from strict TypeScript as an ESM package with five explicit entry points: root, page, data, UI, and communication.
- Kept CVC page lifecycles and attached Form, List, Grid, Select, Pagination, Popup, and Tabs behavior to authored HTML and CSS. Buttons and plain dialogs use native HTML.
- Added nested row-local Select binding, stable row identity and change tracking, scoped lifecycle cleanup, and accessible keyboard/focus behavior.
- Retained framework-reachable Form formatter and validator rules. Removed the unused public `Rule` type alias; no formatter or validator runtime was removed.
- Removed jQuery and legacy convenience utilities from the 2.0 artifact. Preserved the 1.x LGPL source and documentation under `v1/` without changing them.
- Added fixed-artifact JavaScript, TypeScript, and browser consumer checks and M9 accessibility review. Safari is outside the initial 2.0 browser support scope; Playwright WebKit remains engine-only evidence.

This is an unpublished beta candidate in source control. The user deferred npm publication until remaining functionality is complete and personally tested. The existing npm `latest` tag still points to 1.x. See [the migration guide](docs/v2/migration.md) and [M9 gate](docs/implementation/m9-plan.md).

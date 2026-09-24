---
type: UI Component
title: bindPagination
description: Connect authored page buttons to explicit one-based page state and change requests.
tags: [ui, pagination, accessibility]
status: draft
symbols: [bindPagination]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public page types and Pagination export
    git_blob: 6a2ee60393df8898e518a884fc1b8f3c6d6b9cf5
  - id: pagination
    resource: ../../src/ui/pagination.ts
    title: Pagination binding runtime
    git_blob: 0239548e7638456548beb441b55956381272d454
generated: { by: codex/gpt-6-sol, at: 2026-09-24T14:08:17Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T14:08:17Z }
---

`bindPagination` adds page navigation to the buttons an author supplies. It requests a page through a callback; application code updates the data view and then confirms the new state with `set`.[^pagination]

# Quick start

```html
<nav data-role="pages" aria-label="Employees pages">
  <button type="button" data-page-prev>Previous</button>
  <button type="button" data-page-template><span data-page-number></span></button>
  <button type="button" data-page-next>Next</button>
  <output data-page-status></output>
</nav>
```

```ts
import { bindPagination } from "@bbalganjjm/natural_js/ui";

let state = { page: 1, size: 20, total: 83 };
const pages = bindPagination(document.querySelector<HTMLElement>('[data-role="pages"]')!, {
  state,
  onPage(request) {
    state = { ...request, total: state.total };
    pages.set(state);
  }
});
```

# Constructor

`bindPagination(root: HTMLElement, options: { state: PageInput; onPage: (request: PageRequest, event: Event) => void }): PaginationHandle` needs an authored root, valid state, callback, and at least one page control or numeric button template. `page` and `size` are positive safe integers; `total` is a nonnegative safe integer. The computed `pages` is `Math.ceil(total / size)`; `page` is clamped to the last available page or 1 when empty.[^entry][^pagination]

| Marker | Meaning |
|---|---|
| `data-page-first`, `data-page-prev`, `data-page-next`, `data-page-last` | At most one authored button per action. |
| `data-page-template` | Optional one authored button cloned into up to five numbered buttons around the current page. Its subtree may not contain a fixed DOM `id`. |
| `data-page-number` | Optional descendant of the numeric template whose text becomes the page number. Without it, the button text becomes the number. |
| `data-page-status` | Optional status element; text becomes `Page X of Y` or `No pages`, with `aria-live="polite"` when not already authored. |

Invalid structure raises `PAGINATION_MARKUP`; repeated IDs in a numeric template raise `DUPLICATE_ID`. A second live binding of the same root raises `PAGINATION_OWNED`.[^pagination]

# Methods

| Method | Behavior |
|---|---|
| `state()` | Returns the current immutable `PageState`. |
| `set(state)` | Validates and normalizes the new state, then updates buttons, number range, status, and focus. |
| `dispose()` | Removes generated buttons and listener, restores the template and authored disabled/status state, and releases the root. Repeated disposal is safe. |

Methods after disposal raise `PAGINATION_DISPOSED`; invalid state raises `PAGINATION_STATE`.[^pagination]

# Events

| Event | Handler | Behavior |
|---|---|---|
| Native button `click` | `onPage({ page, size }, event)` | Requests a different in-range page. The callback does not mutate state automatically; `this` is not rebound. |

# Behavior

Disabled or unavailable navigation does nothing. Numbered buttons get an `aria-label`; the current number gets `aria-current="page"`. If a focused generated button is replaced during `set`, focus moves to the same page number when present or to the current page button. Native buttons retain keyboard behavior and authored CSS.[^pagination]

# Pitfalls

A list or grid's filter changes `total` and may clamp its page. Call the Pagination handle's `set(list.page()!)` or `set(grid.page()!)` after such changes. Page state starts at 1 even when `pages` is 0.[^pagination]

# Related

[Grid](grid.md) and [List](list.md) offer local page slices. [UI contracts](ui.md) defines `PageRequest`, `PageState`, and `PaginationHandle`.

[^entry]: Public page types and Pagination export
[^pagination]: Pagination binding runtime

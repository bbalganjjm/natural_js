---
type: Example
title: CVC pages in main content, Popup, and Tabs
description: One picker PageDefinition shares Rows across main content, Popup, and People and Preview Tabs in two authored MDI layouts.
tags: [ui-shell, cvc, example, accessibility]
status: draft
sources:
  - id: controller
    resource: ../../examples/vite/m7/main.ts
    title: Shared page definition and container ownership
    git_blob: 25d07df69cbf0c79d0e92bfdef6227ae6f905313
  - id: side
    resource: ../../examples/vite/m7/side.html
    title: Authored side-by-side layout
    git_blob: 0ea08c34a50524406eaffde2a550f4fc39be5de3
  - id: stack
    resource: ../../examples/vite/m7/stack.html
    title: Authored stacked layout
    git_blob: 587c20e109977fc12a091d84248f8d80f3526daf
  - id: browser
    resource: ../../tests/browser/m7-screen.spec.ts
    title: Cross-container and MDI browser checks
    git_blob: 214393e45d84cb88a781304cfa6e26cdc826ea42
generated: { by: codex/gpt-6-sol, at: 2026-09-24T15:43:32Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T15:58:02Z }
---

The M7 Vite example mounts one picker `PageDefinition` independently in main content, a native dialog Popup, and the People and Preview Tab panels. A caller-owned `Rows` store shares the selected person across two authored MDI layouts without repeated DOM IDs.[^controller][^side][^stack]

# Scenario

Open `/m7/side.html` or `/m7/stack.html` under `npm run example`. Open another workspace to keep two MDI instances alive, choose a person in each container, switch among People, Help, and Preview, and use Preview's picker button to choose through that workspace's Popup.[^side][^stack][^browser]

# Components used

| Component | Role |
|---|---|
| `mountPage` | Independent controller instances for main content and the People and Preview Tab pages. |
| `createRows` | Caller-owned shared selection data across all page instances and workspaces. |
| `openPopup` | One native dialog opening, choice result, and cleanup. |
| `bindTabs` | Keyed People, borrowed inline Help, and Preview pages with manual activation. |
| Native `<dialog>` | Authored modal for the plain Dialog case. |

# View

`examples/vite/m7/side.html` places main content before Tabs; `stack.html` reverses the order. Each authored screen has a main host, three keyed Tab buttons and panels, an alert region, a connected native dialog with a direct `[data-page-host]`, and a picker view template. The Preview panel keeps an empty `[data-preview-host]` for its page and a separate authored `[data-preview-output]` for results. The CSS files define two different layouts; the framework creates no layout or theme. All data markers can repeat when another workspace is cloned because they are scoped to its root. Tabs generates document-unique IDs only for ARIA references.[^side][^stack][^controller]

# Controller

`examples/vite/m7/main.ts` defines the picker once. Its view factory clones the authored picker template into a fresh root. The application creates one `Rows<{ selected: string }>` store and passes it to every mount. The controller uses the CVC signal for event listeners, subscribes to shared selection updates with `own` for cleanup, and emits a picked person through `output`. Main, People Tab, and Preview Tab each mount that definition with independent inputs and subscribe to output; Popup receives the same definition and awaits its result. The Help Tab borrows its prewritten inline root. A choice returned by the Popup opened from Preview also updates Preview's authored output. Each workspace owns its main page, Tabs handle, Popup opening, and event controller, and releases them before removing its root.[^controller]

# How it works

The People and Preview Tab picker buttons open the same workspace's Popup while their Tab page remains mounted. A Popup choice opened from Preview appears in both the Popup output and Preview's authored output. Arrow keys move Tab focus without selecting; Enter or Space activates the focused page. Switching away deactivates a page; returning reactivates its retained controller. Popup result completion waits until its dialog is closed and its page is released, so a later opening can use the same host. A second workspace repeats the markers but gets different page instances and ARIA IDs. A choice in either workspace changes the shared Rows value and updates every mounted picker, while Page output remains local to its own container.[^controller][^browser]

# Variations

For a server-authored view, replace the picker factory with a `URL`; keep the same controller and use a separate mount for each container. A borrowed `HTMLElement` view can be mounted in one live container at a time. A plain Dialog needs only authored `<dialog>` markup and native `showModal()`/`close()`.[^controller]

# Pitfalls

The example's `find` helper is local application code, not a Natural-JS selector API. Shared `Rows` belongs to the application and is disposed on page unload; per-page subscriptions are released by `context.own`. When adding a Tab, add a keyed button and panel to both HTML layouts, a matching factory in `main.ts`, and focused tests in `tests/browser/m7-screen.spec.ts`. Keep the factory-view page host empty and put authored results in a separate element inside the panel. Keep authors' CSS and labels intact. Close a workspace through its handles before removing its DOM root.[^controller][^browser]

# Related

[Popup](popup.md), [Tabs](tabs.md), and [the page runtime](page.md) define the public contracts. [The employee example](employee-example.md) exercises Rows/Form/Grid data binding; this example focuses on page containers.

[^controller]: Shared page definition and container ownership
[^side]: Authored side-by-side layout
[^stack]: Authored stacked layout
[^browser]: Cross-container and MDI browser checks

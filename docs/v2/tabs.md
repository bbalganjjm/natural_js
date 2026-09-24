---
type: UI Component
title: bindTabs
description: Bind authored keyed tab buttons and panels to lazy CVC pages with manual keyboard activation.
tags: [ui, tabs, cvc, accessibility]
status: draft
symbols: [bindTabs, TabHandle]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public Tabs exports
    git_blob: e1c3c3d309fb5b5724965ce348396046b1c77db7
  - id: tabs
    resource: ../../src/ui/tabs.ts
    title: Tabs lifecycle and ARIA binding
    git_blob: 4bbd8b9a3b0280ed1ab2c59683bcc5597d7d6920
  - id: page
    resource: ../../src/page/index.ts
    title: Shared CVC page runtime
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
generated: { by: codex/gpt-6-sol, at: 2026-09-24T15:56:13Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T15:58:02Z }
---

`bindTabs` connects authored tab buttons and panels by matching keys. It lazily creates each CVC page, keeps visited pages for reactivation, and changes ARIA and focus state without replacing the author's layout or CSS.[^tabs][^page]

# Quick start

```html
<section data-tabs>
  <div role="tablist" aria-label="Workspace">
    <button type="button" role="tab" data-tab="people">People</button>
    <button type="button" role="tab" data-tab="help">Help</button>
  </div>
  <section role="tabpanel" data-panel="people" hidden></section>
  <section role="tabpanel" data-panel="help" hidden></section>
  <p data-tab-error role="alert" hidden></p>
</section>
```

```ts
import { mountPage } from "@bbalganjjm/natural_js/page";
import { bindTabs } from "@bbalganjjm/natural_js/ui";

const root = document.querySelector<HTMLElement>("[data-tabs]")!;
const tabs = bindTabs(root, {
  initial: "people",
  pages: {
    people: host => mountPage(host, peopleDefinition),
    help: host => mountPage(host, helpDefinition)
  }
});
await tabs.ready;
await tabs.select("help");
```

A URL or fresh-root factory definition can be reused in another Tab, main content, or Popup. A borrowed inline view belongs to only one live page and stays in its panel after disposal.[^page][^tabs]

# Constructor

`bindTabs(root: HTMLElement, options: { initial: string; pages: Record<string, (host: HTMLElement) => TabPage>; errorText?: string }): TabHandle` requires a connected `[data-tabs]` root, one `[role=tablist]` with a nonempty `aria-label` or existing `aria-labelledby` target IDs, matching keyed button/panel pairs, and one authored `[data-tab-error][role=alert]` region. Each button is `type=button` and `role=tab`; each panel is `role=tabpanel`. Keys in `pages` exactly match the authored keys and `initial` names an enabled tab. A page factory returns the small `PageHandle` subset with `ready`, `activate`, `deactivate`, and `dispose`. For prompt supersession and final disposal, a pending `ready` or `activate` must settle when `dispose()` is called; `mountPage` handles provide this cancellation behavior.[^entry][^tabs]

| Option | Default | Meaning |
|---|---|---|
| `initial` | — | First tab key; must be enabled. |
| `pages` | — | Keyed page factory for every authored tab. |
| `errorText` | `Tab could not be opened.` | Text placed in the authored alert region after a page transition fails. |

Invalid markup, duplicate authored IDs, unknown or disabled keys, and duplicate live binding raise `FrameworkError` with an API-specific code.[^tabs]

# Methods

| Member | Behavior |
|---|---|
| `ready` | Resolves when the initial page is active; rejects if it fails. |
| `selected()` | Returns the visible selected key, including a target still loading, or `null` if no page could be activated. |
| `select(key)` | Selects a keyed enabled tab; resolves when active or rejects on failure/cancellation. A later request supersedes an in-flight load. |
| `dispose()` | Cancels pending work, disposes visited page handles, releases listeners, and restores authored attributes. Repeated disposal is safe. |

# Events

| Event | Handler | Behavior |
|---|---|---|
| Native `click` on a tab button | Binder | Selects its keyed page; `this` follows the native event. |
| `Left`/`Right` or vertical `Up`/`Down`; `Home`/`End` | Binder | Moves focus among enabled tabs without activating them. |
| `Enter`/`Space` | Binder | Activates the focused tab. |

# Behavior

The binder pairs tabs by `data-tab` and `data-panel`, never by position. It adds document-unique IDs only when required for `aria-controls` and `aria-labelledby`, checks authored ID collisions, and keeps one tab in the page Tab sequence with roving `tabindex`. The selected tab has `aria-selected=true`, its panel is visible, and a loading panel has `aria-busy=true`. An empty panel receives `tabindex=0` so keyboard users can enter it.[^tabs]

Switching deactivates the prior page before revealing and starting the target. Visited pages remain in their panels and reactivate on revisit. A failed or canceled page is disposed and evicted so a later selection can call its factory again. If a target fails after the prior page deactivated, the binder tries to reactivate it and restore selection; failed recovery shows the authored alert and reports `selected() === null`. If the prior page itself fails to deactivate, it is evicted and the alert appears with no active page. A newer selection wins over an older pending one.[^tabs][^page]

# Pitfalls

A custom TabPage whose pending operation never settles after `dispose()` can block later selections; use `mountPage` or implement the same cancellation contract. A borrowed inline page root must already be inside its Tab panel; it cannot be mounted simultaneously in a Popup. Page output while a Tab is inactive is ignored by the page runtime. The author supplies tab names, error region, visible focus styles, and panel content; this binder does not provide a theme or document-tab model.[^tabs][^page]

# Related

[The page runtime](page.md) defines the lifecycle that Tab factories return. [Popup](popup.md) can mount the same fresh-root definition. [The page-container example](page-containers-example.md) shows two authored layouts. [The M7 plan](../implementation/m7-plan.md) records fixed Tabs scope.

[^entry]: Public Tabs exports
[^tabs]: Tabs lifecycle and ARIA binding
[^page]: Shared CVC page runtime

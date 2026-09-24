---
type: UI Component
title: openPopup
description: Run one CVC page in an authored native dialog and settle its result after close and cleanup.
tags: [ui, popup, cvc, accessibility]
status: draft
symbols: [openPopup, PopupHandle]
sources:
  - id: entry
    resource: ../../src/ui/index.ts
    title: Public Popup exports
    git_blob: e1c3c3d309fb5b5724965ce348396046b1c77db7
  - id: popup
    resource: ../../src/ui/popup.ts
    title: Popup lifecycle and result
    git_blob: 49ec03d610615aff95952804541c94892799535f
  - id: page
    resource: ../../src/page/index.ts
    title: Shared CVC page runtime
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
generated: { by: codex/gpt-6-sol, at: 2026-09-24T20:24:21Z }
verified:
  - { by: codex/gpt-6-sol, at: 2026-09-24T15:58:02Z }
---

`openPopup` mounts a `PageDefinition` inside an existing `<dialog>`. The author owns its title, close button, HTML, and CSS; the wrapper owns the modal lifetime, first result, and its private page handle.[^popup][^page]

# Quick start

```html
<button type="button" data-open>Choose</button>
<dialog data-picker aria-label="Choose employee">
  <h2>Choose employee</h2>
  <div data-page-host></div>
  <form method="dialog"><button>Cancel</button></form>
</dialog>
```

```ts
import { openPopup } from "@bbalganjjm/natural_js/ui";
import type { PageDefinition } from "@bbalganjjm/natural_js/page";

const picker: PageDefinition<void, string> = {
  view: new URL("./picker.html", import.meta.url),
  controller({ root, signal, output }) {
    return {
      init() {
        root.querySelector("[data-pick]")?.addEventListener(
          "click", () => output("Kim"), { signal }
        );
      }
    };
  }
};
const dialog = document.querySelector<HTMLDialogElement>("[data-picker]")!;
document.querySelector("[data-open]")?.addEventListener("click", async event => {
  (event.currentTarget as HTMLButtonElement).focus({ preventScroll: true });
  try {
    const popup = openPopup(dialog, picker);
    const choice = await popup.result;
    if (choice !== undefined) console.log(choice);
  } catch (error) {
    console.error(error);
  }
});
```

The controller emits a result from an active page event; output during `init` or initial `activate` is ignored by `mountPage`. Use the same URL or fresh-root factory definition in main content, Popup, and Tabs to create independent controllers. A borrowed `HTMLElement` view can have only one live mount.[^page][^popup]

# Constructor

`openPopup<Input, Output>(dialog: HTMLDialogElement, definition: PageDefinition<Input, Output>, input?: Input): PopupHandle<Output>` opens one connected authored dialog. It needs exactly one direct `[data-page-host]` child. That host is empty for a URL/factory view or already contains the borrowed view root. Invalid, detached, already-open, or malformed hosts fail synchronously with `FrameworkError`. Each successful opening has a new handle and controller.[^entry][^popup]

# Methods

| Member | Behavior |
|---|---|
| `ready` | Resolves after the page initializes and first activates; rejects if loading fails or the page is canceled. |
| `result` | Resolves with the first active output or `undefined` after ordinary close and cleanup; disposal or detachment rejects only if no output/ordinary close was already reserved. Page or cleanup failure rejects. |
| `close()` | Closes without choosing a value when no output was reserved; waits for result settlement. |
| `dispose()` | Ends this opening and releases its page and listeners. Repeated disposal is safe. |

The first output or ordinary close reserves the result. A later `dispose()` cannot replace that reserved value. An ordinary close during loading resolves `result` to `undefined` after cleanup while pending `ready` rejects with `AbortError`. Direct disposal before either terminal cause rejects an unsettled result with `AbortError`. A cleanup failure rejects `result` even after a value was chosen. Await `result` before reopening the same dialog.[^popup]

# Events

| Event | Handler | Behavior |
|---|---|---|
| Native `cancel`, `close`, or `method=dialog` | Browser dialog behavior | Uncanceled close settles without a value unless page output came first; `this` follows the native event. |
| Page `output(value)` | CVC controller | First active output closes this opening and becomes its result. |

# Behavior

The wrapper restores focus to the opener when it remains connected. The native dialog provides modal behavior; the wrapper keeps Tab and Shift+Tab inside the dialog at focus boundaries and allows the newly focused control to scroll into view. It also scrolls the current dialog focus into view after opening and after the CVC page becomes ready. An owning CVC page should register `context.own(() => popup.dispose())`. Detaching the dialog or its page host aborts an opening with no earlier reserved output or ordinary close; a reserved result survives detachment unless cleanup fails. The wrapper observes only while that opening lives. No visual overlay or global popup service is generated.[^popup]

A plain authored `<dialog>` that does not host a CVC page uses native `showModal()` and `close()` directly; there is no separate Dialog binder.[^popup]

# Pitfalls

Keep the close button and accessible name in authored dialog HTML, outside `[data-page-host]`. Author CSS must constrain and scroll a dialog taller than the viewport; the M7 example uses `max-height: calc(100dvh - 2rem)` and `overflow-y: auto`. Focus scrolling cannot repair a dialog whose own box extends past the viewport. A pointer click does not focus its button in every browser, so focus the opener before `openPopup` when that button should regain focus. Do not reuse a borrowed view in two live containers. Treat `ready` as page readiness and `result` as complete close and cleanup; an early `ready` rejection can accompany an ordinary-close `result` of `undefined`.[^popup][^page]

# Related

[The page runtime](page.md) defines `PageDefinition`, controller output, and cleanup. [Tabs](tabs.md) uses the same page runner. [The page-container example](page-containers-example.md) shows two authored layouts. [The M7 plan](../implementation/m7-plan.md) records the accepted container boundary.

[^entry]: Public Popup exports
[^popup]: Popup lifecycle and result
[^page]: Shared CVC page runtime

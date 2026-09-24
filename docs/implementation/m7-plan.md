---
type: Plan
title: Natural-JS 2.0 M7 page UI plan
description: Approved native Dialog, Popup, and Tab implementation with three-browser and agent-task evidence.
tags: [meta, plan, ui, cvc, accessibility]
status: draft
sources:
  - id: contract
    resource: m1-contract.md
    title: Approved CVC and Popup result design
    git_blob: 5cb7c544900bbd86867971e87003518858e498e1
  - id: roadmap
    resource: roadmap.md
    title: First-release and M7 boundary
    git_blob: bb294e3a572c9778fb77679bbe9ce294c68d2841
  - id: m6
    resource: m6-plan.md
    title: Approved M6 data UI and verification
    git_blob: e9541ee00039742219ba33bdebc086a862fa4ab7
  - id: page
    resource: ../../src/page/index.ts
    title: One CVC runtime and lifecycle
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: legacy-popup
    resource: ../../v1/docs/ui/popup.md
    title: Preserved 1.x Popup intent and behavior
    git_blob: d5d844439c513353a6185ba7c7f1738623cdef86
  - id: legacy-alert
    resource: ../../v1/docs/ui/alert.md
    title: Preserved 1.x Alert behavior used by Popup
    git_blob: 8bd5a5bfa861c28584b80058762d4c46b692acec
  - id: legacy-tab
    resource: ../../v1/docs/ui/tab.md
    title: Preserved 1.x Tab intent and behavior
    git_blob: 4e8375202dd44ac7515ec5b99d5f8746f1d38d5f
  - id: tabs-apg
    resource: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
    title: WAI-ARIA Tabs pattern
  - id: dialog-apg
    resource: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
    title: WAI-ARIA modal Dialog pattern
  - id: html-dialog
    resource: https://html.spec.whatwg.org/multipage/interactive-elements.html?elementdef-dialog=
    title: HTML dialog close and cancel behavior
generated: { by: codex/gpt-6-sol, at: 2026-09-24T15:59:01Z }
---

M7 was approved by the user on 2026-09-25 after the M6 gate closed, including the explicit M1 Popup amendment. The first 2.0 release needs Dialog, Popup, and fixed Tab navigation; document tabs and an application shell remain M12.[^roadmap][^m6]

# Goal

Run the same `PageDefinition` and CVC lifecycle in main content, an authored Popup, and an authored Tab panel. Dialog attaches behavior to existing HTML. Preserve each author's HTML and CSS and use native focus and keyboard semantics. Closing, reloading, or disposing a page releases its owned resources; a retained inactive Tab keeps its controller but cannot emit output, while final disposal releases it.[^contract][^page]

# Checkpoint

- `mountPage` already accepts a URL, borrowed HTML element, or factory, creates an independent controller per mount, aborts pending work, and releases page-owned resources in reverse order. Its generated root needs an empty host; borrowed roots stay caller-owned. M7 must wrap this runtime rather than copy its loading, HTML checks, controller calls, or cancellation path.[^page]
- M6 proved two simultaneous ID-clean CVC employee pages, authored data UI, focus repair, three-browser tests, and a performance gate. M7 must preserve those contracts when the same page appears in more than one container.[^m6]
- In 1.x, Popup reused a current block or fetched a page through an alert layer and injected a `caller`; Tab matched navigation and content by position, with optional fetched pages and Controller hooks. The 2.0 migration preserves page reuse, close/result, and tab activation. It does not copy positional identity, implicit Controller back-references, global lookup, visual option catalogs, draggable geometry, or string-named hooks.[^legacy-popup][^legacy-tab][^contract]

# Scope boundary

| Area | Public contract | Private work | Excluded |
|---|---|---|---|
| Dialog | Native authored `<dialog>`, `showModal()`, and `close()`; no new framework export | Only a shared close/focus operation if Popup supplies a second real caller | Generated overlay, theme, focus-trap library |
| Popup | Approved `openPopup` and narrow `PopupHandle` | One `mountPage`, result settlement, scoped detachment observation, focus restoration | Separate loader, global popup registry, implicit caller mutation |
| Fixed Tabs | Approved `bindTabs` and `TabHandle` | Explicit key pairing, ARIA IDs/state, keyboard behavior, one page handle per visited tab | Document tabs, visual theme, position-based identity |

# Steps

| Step | Work | Reviewable evidence |
|---|---|---|
| 0. Audit M6 and legacy intent | Recheck M6 package and browser results, `mountPage` ownership and output timing, and 1.x Alert/Popup/Tab flows. List only behavior needed for the first release. | An inclusion/exclusion table names each needed framework responsibility and its private/public owner. |
| 1. Freeze usage contract | Review the proposed HTML/TypeScript below, including the explicit M1 PopupHandle/host amendment. Check the authored Dialog host, same URL/factory definition in three containers, a separately borrowed inline panel, output timing, Tab keys, manual keyboard activation, generated ARIA relationships, and failure/cleanup policy against current CVC code. The user approved the amendment; update M1 before publishing the M7 API. | The examples identify one PageDefinition, an independent Controller per mount, exact public types, and every framework/application responsibility; any required change returns for review. |
| 2. Dialog | Use authored native `<dialog>` with `showModal()`/`close()` for standalone dialogs; no public Dialog binder is proposed. Popup adds only CVC lifetime/result behavior and may share a private close/focus operation if a second real caller needs it. Treat uncanceled `cancel`, native `close()`, and `method=dialog` as ordinary close paths; a prevented cancel leaves it open. Do not mutate `open` directly. | Enter/Space, Escape/cancel, close button, native close event, accessible name, opener focus restoration, nested dialog order, missing opener, repeated open/close, and disposal pass in three engines.[^dialog-apg][^html-dialog] |
| 3. Popup | Build `openPopup` on `mountPage` with per-opening `ready` and `result`. The first terminal cause wins: an active page output reserves its value and closes the dialog; ordinary wrapper/native close reserves `undefined` if no value was chosen; direct disposal reserves `AbortError` only when neither happened. A later `dispose()` cannot replace an already reserved output or close result. Successful output or ordinary close settles `result` after the native close event (or the closed-state fallback when no event arrives), page cleanup, listener removal, and focus restoration, so awaiting success permits immediate reopening. Host detachment, or direct disposal when it is the first terminal cause, settles after cleanup without waiting for a close event that may never fire. If cleanup fails after a reserved successful value or ordinary close, reject `result` with the cleanup error instead of hiding it. Direct `dispose()`, owning CVC disposal, or external host detachment rejects an unsettled result with `AbortError`. Closing during load still resolves `result` with `undefined` after cleanup while pending `ready` rejects with `AbortError`; direct disposal rejects both. Observe native closing `beforetoggle` immediately where supported, with an `open`-attribute observation fallback checked in Chromium, Firefox, and WebKit; abort a pending page before the later `close` event completes settlement. A prevented `cancel` does not close or settle. The wrapper observes `PageHandle.ready` even if a caller only awaits `result`; a load/init failure that settles first rejects `result` with that same rejection, including combined cleanup failure. Reopening creates a new page and result. | Same page definition works in main content and Popup. Rapid open/close, close during load, late output, initialization failure, output/close races, ignored early output, repeated disposal, owning-page disposal, and raw DOM detachment settle once and release work. A per-opening observer detects external host detachment; no global observer is needed.[^contract][^html-dialog] |
| 4. Tabs | Bind authored tab buttons and panels by explicit stable keys rather than DOM position. Mount a tab page only when first selected; retain/deactivate it on exit and reactivate on revisit. Deactivate the previous page, hide its panel, reveal the target panel, set its temporary selected/busy state, then call `mountPage`, which begins initialization/activation immediately. Cancel superseded loads and commit only the latest request. A failed or canceled page handle, including one that fails on reactivation, is disposed and removed from the cache so a later selection creates a new handle. If the target fails after successful prior deactivation, reactivate the prior page and restore its panel/selection; if recovery or prior deactivation fails, announce an authored error state with no active page. Arrows/Home/End move focus; Enter/Space activates. Fixed tabs belong here; document tabs wait for M12. | Roving `tabindex`, focus, `aria-selected`, `aria-controls`/`aria-labelledby`, hidden panels, async switch races, disabled tabs, borrowed inline panels, lazy load, revisit, and disposal preserve at most one active page and correct CVC transitions.[^tabs-apg] |
| 5. Container integration | Reuse one PageDefinition and business controller code in main, Popup, and Tab, creating an independent controller instance for each mount; exercise nested Popup from a Tab, two MDI screens, shared application data, and page output. Data markers may repeat across instances; generated ARIA IDs stay document-unique without rewriting author IDs. | The same business page follows one lifecycle, keeps outputs instance-local, and has no duplicate IDs or cross-screen focus leak. |
| 6. Cost, docs, and package gate | Run focused browser regressions in Chromium, Firefox, and WebKit; installed JS/TS consumers; repeat-open listener/DOM measurements; package audit; and same-task English OKF concepts, indexes, log, and stamps. Give a fresh docs-first agent this fixed task: add a third authored Preview tab to both example layouts, reuse the existing page definition, open the existing picker Popup from that tab, and display its selected result. First-run acceptance: build/typecheck, focused Chromium keyboard/manual-activation/result/two-instance/ID regression, and changed OKF check. Record code retries, unique files, UTF-8 read/review output bytes, changed files/lines, elapsed time, and actual tokens if exposed. | Public names, declarations, code, examples, and docs agree. Record any lookup/edit-cost increase; compare it only with the same task and counting method, never infer savings from a different M6 task. Changed/full OKF checks report zero errors; exceptions are recorded in the active plan. |

# Approved usage contract

The following is the approved M7 contract. Its implemented behavior is documented in the Popup and Tabs concepts after source verification. Standalone Dialog uses native `HTMLDialogElement.showModal()` and `close()`; no extra public binder is needed. Popup takes a connected authored `<dialog>` with exactly one direct `[data-page-host]` element. That host is empty for URL/factory views; a borrowed `HTMLElement` view must already be inside it and remains caller-owned. The visible title and close button stay authored; the framework owns only display, focus, CVC lifetime, and result. Invalid, detached, already-open, or malformed hosts fail synchronously with a short `FrameworkError` before `showModal()`, leaving no pending result. If a cancelable opening `beforetoggle` prevents display, check `dialog.open` and fail the same way. This narrows M1's `HTMLElement` host to `HTMLDialogElement` as approved by the user.[^contract][^html-dialog]

The minimal Popup handle owns one opening:

```ts
interface PopupHandle<Output> {
  readonly ready: Promise<void>;
  readonly result: Promise<Output | undefined>;
  close(): Promise<void>;
  dispose(): Promise<void>;
}
declare function openPopup<Input, Output>(
  dialog: HTMLDialogElement, definition: PageDefinition<Input, Output>, input?: Input
): PopupHandle<Output>;
```

The caller can inspect its authored dialog after `ready`; only `result` carries the choice. The internal `PageHandle` remains private and is disposed once after a value or close is reserved, before `result` settles. Awaiting `result` means the dialog is closed, its page host is reusable, and focus/listeners are settled. Ordinary close during loading resolves `result` to `undefined` while `ready` rejects with `AbortError`; direct disposal rejects an unsettled `result`. A user action after activation calls `PageContext.output(value)`; output during init/activation is ignored by the existing page runtime. The approved contract preserves M1's choice/abort meaning while making completion include cleanup and changing its host type and handle shape.[^contract][^page]

## Authored HTML and page use

The same `PageDefinition` can run in three separate containers because its view is a URL or a factory returning a fresh root. A borrowed `HTMLElement` view is exclusive to one live mount. The example leaves layout and styling to the author; data markers may repeat in another MDI copy. The Tab binder adds document-unique IDs only when connecting ARIA references and rejects colliding authored IDs.[^page][^tabs-apg]

```html
<main data-main-page></main>
<button type="button" data-open-picker>Choose employee</button>
<dialog data-picker aria-label="Choose employee">
  <h2>Choose employee</h2>
  <div data-page-host></div>
  <form method="dialog"><button>Cancel</button></form>
</dialog>

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

`<dialog>` and its page host must already be connected. Its direct page host is empty for the URL view in this example; a borrowed root can already live there. The title and Cancel button stay outside it. A separate plain Dialog uses the native `showModal()`/`close()` methods with an authored accessible name and close button. Neither case needs generated visual markup.[^dialog-apg][^html-dialog]

```ts
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageDefinition } from "@bbalganjjm/natural_js/page";
import { openPopup, bindTabs } from "@bbalganjjm/natural_js/ui";
import { createEmployeePicker } from "./employee-picker.controller.js";
import { createHelp } from "./help.controller.js";

type Picked = { id: string; name: string };
const picker: PageDefinition<{ department: string }, Picked> = {
  view: new URL("./employee-picker.html", import.meta.url),
  controller: createEmployeePicker
};
const help: PageDefinition = {
  view: new URL("./help.html", import.meta.url),
  controller: createHelp
};

const mainHost = document.querySelector<HTMLElement>("[data-main-page]")!;
const dialog = document.querySelector<HTMLDialogElement>("[data-picker]")!;
const tabsRoot = document.querySelector<HTMLElement>("[data-tabs]")!;

const main = mountPage(mainHost, picker, { department: "D01" });
const tabs = bindTabs(tabsRoot, {
  initial: "people",
  pages: {
    people: host => mountPage(host, picker, { department: "D01" }),
    help: host => mountPage(host, help)
  }
});
await Promise.all([main.ready, tabs.ready]);

const popup = openPopup(dialog, picker, { department: "D01" });
const selected = await popup.result; // First active output, or undefined on ordinary close.
await tabs.select("help");
```

Application code puts the two Popup lines in the authored open button's click handler and focuses that button before opening when it should regain focus after a pointer click; there is no global selector. The picker controller calls `context.output(value)` only after activation, usually in a user event handler. If the calling CVC page owns an open Popup, it registers `context.own(() => popup.dispose())`. A Tab factory returns the `PageHandle` from `mountPage`; the binder owns its deactivation and disposal. For an inline borrowed page, place its root inside one panel and have that panel's factory call `mountPage(host, { view: inlineRoot, controller })`; no second live mount can claim that root.[^page]

## Approved Tab surface

```ts
import type { PageHandle } from "@bbalganjjm/natural_js/page";

type TabPage = Pick<PageHandle, "ready" | "activate" | "deactivate" | "dispose">;
interface TabHandle {
  readonly ready: Promise<void>;
  selected(): string | null;
  select(key: string): Promise<void>;
  dispose(): Promise<void>;
}
declare function bindTabs(root: HTMLElement, options: {
  initial: string;
  pages: Record<string, (host: HTMLElement) => TabPage>;
  errorText?: string;
}): TabHandle;
```

This is the approved small UI contract; the entry export is added with implementation. `data-tab` and `data-panel` keys pair one authored button with one panel; missing or duplicate keys fail at binding. The binder sets `aria-controls`, `aria-labelledby`, `aria-selected`, roving `tabindex`, and `hidden` without replacing HTML or CSS. Keyboard arrows/Home/End move focus across enabled tabs; Enter/Space or click calls `select`. Page mounts are lazy and retained while inactive. The authored `[data-tab-error][role=alert]` region is required at binding. A panel with no focusable content receives `tabindex=0`, so Tab can enter it. While a target loads, it is visible, temporarily `aria-selected=true`, and `aria-busy=true`; `selected()` reports that visible key. Clear `aria-busy` when the request succeeds, fails, or is superseded. On target failure the previous panel/selection is restored only if prior deactivation succeeded and reactivation succeeds. If initial load, prior deactivation, or recovery fails, `selected()` is `null` and the region announces `errorText` (default English). Application copy can replace it. `select()` rejects with the underlying page error. A failed new activation otherwise reactivates the previous page and restores its selected state. No separate registry, theme, or document-tab engine is proposed.[^tabs-apg][^page]

# Next action

M7 is complete on `2.0.0-alpha.0`. Review [the proposed M8 plan](m8-plan.md) and its fixed three-task comparison protocol; do not start M8 implementation or a beta release before separate user approval.

# Decisions

- M1 specifies `openPopup(host: HTMLElement, definition, input?): PopupHandle<Output> extends PageHandle<Output>`. The proposed M7 amendment changes the host to `HTMLDialogElement` and narrows the handle to `ready`, `result`, `close()`, and `dispose()`; inherited `activate()`, `deactivate()`, `reload()`, `onOutput()`, and `root` have no necessary Popup responsibility. First-output/ordinary-close/abort result semantics remain. The user approved this public contract amendment on 2026-09-25; M1's declaration, host example, and handle/root wording are updated in this milestone.[^contract]
- Use one page loader/controller path. Containers own display state, focus, and their child `PageHandle`; the page runtime owns its root and controller. Parent disposal flows down once, in a defined order.[^page]
- Use authored dialog, buttons, tab strip, panels, labels, and CSS. Generate only IDs needed to connect ARIA relationships, checking the document for collisions. Do not publish position, theme, drag, overlay-color, or generic container registry utilities.[^legacy-popup][^legacy-tab]
- Pass typed input to each page and use `output(value)` for an explicit result. Do not recreate the 1.x implicit `caller` mutation or method-name dispatch. Application code owns navigation decisions and business data conversion.[^contract]
- Dialog/Popup focus restoration and Tab keyboard behavior are acceptance gates, not optional styling. Prefer browser-native dialog behavior where it covers the contract. Container wrappers do not make a separate data store or Form rule engine.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Initial planning | Compared the M1 Popup contract, current `mountPage`, M6 data UI gate, roadmap, and preserved 1.x Popup/Tab usage. No M7 runtime or public API has been added. |
| 2026-09-24 | Independent plan review | Two separate read-only reviewers compared this proposed contract with M1, the current page runtime, preserved 1.x UI, WAI-ARIA Tabs/Dialog guidance, and HTML Dialog closing rules. They prompted corrections to host ownership, Popup result/cleanup races, Tab lifecycle and ARIA, and the fixed agent task. The M1 amendment was approved on 2026-09-25; no M7 code existed at review time. |
| 2026-09-25 | Popup and Tabs source review | An independent source audit found a superseded slow-deactivation bug; the binder now retains the previous controller for revisit. A separate documentation audit identified an absent `aria-labelledby` target check, a native-close/output fallback race, and missing cross-container Rows evidence; these were corrected before the final gate. |
| 2026-09-25 | Browser acceptance | After the Preview addition, `popup.spec.ts` (8), `tabs.spec.ts` (7), and `m7-screen.spec.ts` (5) passed in Chromium 20/20, WebKit 20/20, and fresh-cache Firefox 20/20. The screen tests cover two authored layouts, two simultaneous MDI workspaces, one PageDefinition in main/People/Preview/Popup, shared Rows, independent outputs, native Dialog, manual tab keyboard activation, nested Popup focus, late cleanup, and zero duplicate IDs. Twenty consecutive Popup openings leave no owned DOM/listener growth. |
| 2026-09-25 | Build and package | `npm run build`, `npm run typecheck`, Vitest 81/81, and installed JS/TS consumers passed. The dry-run package has 98 files and 136,368 bytes, with public JS/declaration entries for all roles and no `v1/`, docs, examples, tests, `js/`, or jQuery. |
| 2026-09-25 | Fixed docs-first agent task | A fresh agent added Preview to both layouts using the existing page definition and Popup without framework edits. First run passed build/typecheck, Chromium integration 5/5, and changed OKF check. Code retries: 0; unique files read: 22; UTF-8 read/search/review output: about 106,209 bytes; changed files/lines: 7 (+87/-24); elapsed: 12m03s. Actual token usage was unavailable. Its output-byte method is not directly comparable to previous milestone tasks. |
| 2026-09-25 | OKF docs | An independent agent compared architecture, package, UI contracts, Popup, Tabs, and the page-container example with source and focused regressions. Its corrections were applied before verified stamps. Changed and full checks cover 30 concepts and 5 reserved files with zero errors and warnings. |

# Open questions

- The native dialog opener may disappear before closing. Popup then tries a connected neighboring control or containing dialog; Tabs moves focus to a remaining tab or its root. Focus and repeated-close behavior passed the three browser engines. No M7 implementation blocker remains.
- M8 must use one pinned counting method and the M0 fixed tasks before interpreting context or token savings; the M7 Preview task is one usability sample.

[^contract]: Approved CVC and Popup result design
[^roadmap]: First-release and M7 boundary
[^m6]: Approved M6 data UI and verification
[^page]: One CVC runtime and lifecycle
[^legacy-popup]: Preserved 1.x Popup intent and behavior
[^legacy-tab]: Preserved 1.x Tab intent and behavior

[^tabs-apg]: WAI-ARIA Tabs pattern
[^dialog-apg]: WAI-ARIA modal Dialog pattern
[^html-dialog]: HTML dialog close and cancel behavior
[^legacy-alert]: Preserved 1.x Alert behavior used by Popup

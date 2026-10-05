---
type: UI Component
title: bindDocuments
description: Bind dynamic keyed document tabs to authored templates and retained CVC page instances with guarded close and explicit reload.
tags: [ui, documents, cvc, accessibility]
status: draft
symbols: [bindDocuments, DocumentHandle]
sources:
  - id: documents
    resource: ../../src/ui/documents.ts
    title: Authored document templates, keyed entries and close policy
    git_blob: 9d1da99633d4c2525eb6440b7aed98bb8753cb61
  - id: pages
    resource: ../../src/ui/tab-pages.ts
    title: Private shared static and dynamic page-tab coordination
    git_blob: 4e0f2ee8ee62e95f0b3e47d7a305ecffbe53bd31
  - id: page
    resource: ../../src/page/index.ts
    title: Existing CVC page lifecycle
    git_blob: f753a91b97c8137bcb4cdc5a476f13a4cf098588
  - id: browser
    resource: ../../tests/browser/documents.spec.ts
    title: Dynamic document browser checks
    git_blob: 153d53803a071dad845cb8c56f90f7f23a677cbb
generated: { by: codex/gpt-6, at: 2026-10-05T08:49:05Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T08:49:05Z }
---

bindDocuments adds document creation, activation, reload and close to caller-authored tabs and panels. Each key retains a PageHandle-compatible instance while inactive; there is no second page runtime, URL router, global request queue or application store.[^documents][^pages][^page]

# Quick start

```html
<section data-documents>
  <div role="tablist" aria-label="Documents">
    <template data-document-tab-template>
      <span>
        <button type="button" role="tab" data-document-tab>
          <span data-document-title></span>
        </button>
        <button type="button" data-document-close>Close document</button>
      </span>
    </template>
  </div>
  <div data-document-items></div>
  <div data-document-panels>
    <template data-document-panel-template>
      <section role="tabpanel"></section>
    </template>
  </div>
  <p data-document-empty>No open documents</p>
  <p data-document-error role="alert" hidden></p>
</section>
```

```ts
import { mountPage } from "@bbalganjjm/natural_js/page";
import { bindDocuments } from "@bbalganjjm/natural_js/ui";

const documents = bindDocuments(root, {
  beforeClose: key => !hasUnsavedChanges(key) || window.confirm("Discard changes?")
});
await documents.open("employee:42", {
  title: "Employee 42",
  page: host => mountPage(host, employeeDefinition, { employeeId: 42 })
});
await documents.select("employee:42");
await documents.reload("employee:42");
await documents.close("employee:42");
await documents.dispose();
```

root, employeeDefinition and hasUnsavedChanges are application-owned values. A page factory explicitly captures input and owns its output subscription. Reopening an existing key preserves its original title/factory/input; close and reopen to supply a new descriptor.[^documents]

# Constructor

bindDocuments(root: HTMLElement, options?: { beforeClose?: (key: string) => boolean | Promise<boolean>; errorText?: string }): DocumentHandle requires a connected data-documents root. It contains one named authored role=tablist, a separate data-document-items host, one data-document-panels container holding only the panel template, a separate data-document-empty element and one data-document-error[role=alert]. These five regions must be distinct and cannot contain each other. The tab template has one wrapper with sibling native tab/close buttons and one text-only title marker inside the tab. Its cloned wrappers enter data-document-items outside the tablist; the named tablist owns only the generated tab IDs through aria-owns. Native close buttons remain available outside that ARIA ownership. The panel template has one empty role=tabpanel HTML root. Templates cannot contain fixed IDs, executable content, inline event handlers, nested document binders or extra interactive controls.[^documents]

# Options

| Option | Default | Responsibility |
|---|---|---|
| beforeClose | Permit close | Application predicate for each close; a boolean or resolving boolean promise. |
| errorText | Document could not be opened or closed. | Text in the authored alert after a lifecycle/guard failure. |

Each factory returns ready, activate, deactivate and dispose from PageHandle. ready already includes initial activation. A custom handle must settle pending ready/activate after disposal; mountPage implements that cancellation contract. The binder owns page disposal. No controller lookup or mutable request bag is provided.[^documents][^pages][^page]

# Methods

| Member | Behavior |
|---|---|
| open(key, { title, page }): Promise<void> | Adds/selects a nonempty key and title, or selects the retained existing key without consuming its new descriptor. |
| select(key): Promise<void> | Activates an open key. Latest selection supersedes a pending selection. |
| selected() | Returns the current visible string key, including a loading target; null when no document is selected. |
| keys(): readonly string[] | Independent insertion-order snapshot of open keys, including entries whose page failed. |
| close(key): Promise<boolean> | Runs the application guard; false retains the entry, true disposes/removes it. An absent key resolves true. Repeated in-flight close calls share one promise. |
| reload(key): Promise<void> | Disposes the current instance and selects a fresh page from the original descriptor. No close guard runs because the document entry remains open. |
| dispose(): Promise<void> | Aborts listeners/guards, disposes owned pages and removes generated tab/panel clones; restores authored state. Repeated calls share the cleanup promise. |

Unknown keys raise DOCUMENT_KEY for selection/reload. A permitted close blocks new work on that entry with DOCUMENT_CLOSING. Invalid root/markup/options/handle/ownership use DOCUMENT_ROOT, DOCUMENT_MARKUP, DOCUMENT_OPTIONS, DOCUMENT_PAGE or DOCUMENT_OWNED. Invalid close-policy results use DOCUMENT_GUARD. Mutating operational calls after disposal reject DOCUMENT_DISPOSED; selected()/keys() return null/an empty snapshot. Superseded work and guards canceled by disposal reject AbortError; all framework errors identify api bindDocuments.[^documents][^pages]

# Behavior

The original templates stay in place. Each new document clones one tab wrapper and one panel, allocates document-unique tab/title/panel IDs, writes the title as text and connects ARIA references. Only the tab buttons belong to the tablist through aria-owns; generated sibling close buttons remain outside its logical children. The binder restores the original role/ownership attributes on disposal. With no entries, the named list is role=group to avoid an invalid empty tablist; opening an entry restores tablist semantics. The configured horizontal/vertical aria-orientation is absent in the empty group and restored while populated and on disposal.[^documents]

Exactly one tab has roving tabindex. Native close buttons retain their authored Tab accessibility in the separate item host. Left/Right, or Up/Down for vertical orientation, and Home/End move focus; Enter/Space selects. Delete on a tab invokes the same close guard as its native close control. Page inputs retain their ordinary key behavior. The adjacent document after a permitted selected close is chosen to the right, then left. Removing a focused tab/page transfers focus to that neighbor; when none remains, focus moves to an available control in the authored empty state or to the container. Closing an inactive entry does not cancel another document's pending selection.[^documents]

Switching deactivates the previous page, then starts/resumes the target. Successful pages keep their DOM/controller state while inactive. A failed/canceled page handle is disposed and evicted but the document entry stays for retry. A failed target tries to reactivate the prior retained page, and otherwise leaves no active page with the authored alert. The private coordinator is shared with static Tabs; it preserves the existing wait for slow deactivation and does not move CVC execution into UI.[^pages][^page]

Guard rejection/throw leaves the entry intact. Binder disposal cancels a pending guard promptly, even if the application promise never settles. Permitted close removes DOM after page cleanup. Final disposal waits for page cleanup, including concurrent close/reload removals. Cleanup failure is propagated after owned DOM cleanup; the first failure is retained even when its rejection value is null or undefined.[^documents][^pages]

# Pitfalls

beforeClose owns business dirty-state policy; the framework does not inspect CSS classes or Rows. reload intentionally recreates page-local state without a close guard, so the application should confirm a destructive reload before calling it. Durable Rows can live above the page instance. Generated view factories or URLs can be reused in main content, Documents and Popup; a borrowed inline root belongs to one live mount.[^documents][^page]

A user's never-settling deactivate/dispose/owned-cleanup callback can delay cleanup, matching mountPage. There is no automatic state eviction, maximum-tab policy, drag engine, URL history, close-all confirmation or timer; applications compose explicit methods and native controls. Automated checks cover authored states and keyboard flows; manual assistive-technology review remains open.[^page][^browser]

# Related

[Tabs](tabs.md) handles a fixed authored set. [Notify](notify.md) announces application messages. [The shell example](shell-example.md) connects this binder to caller-owned Rows and a single CVC definition. [Popup](popup.md) owns modal results.

[^documents]: Authored document templates, keyed entries and close policy
[^pages]: Private shared static and dynamic page-tab coordination
[^page]: Existing CVC page lifecycle
[^browser]: Dynamic document browser checks

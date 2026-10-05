---
type: Example
title: Application shell in two CVC layouts
description: Compose independent document workspaces, persistent notifications, shared Form data and Popup with one CVC editor definition.
tags: [ui, cvc, example, accessibility]
status: draft
sources:
  - id: controller
    resource: ../../examples/vite/m12/main.ts
    title: Application shell ownership and shared editor definition
    git_blob: 959409cbc96ca35251a09d205d5f13b1ac6756ac
  - id: side
    resource: ../../examples/vite/m12/side.html
    title: Authored side-menu shell layout
    git_blob: f5d6357f24cd003804631e1dbdb8464ab455a1e1
  - id: stack
    resource: ../../examples/vite/m12/stack.html
    title: Authored stacked-menu shell layout
    git_blob: 1cd291dc40218b7bb013caa6cdfd414f606d48e5
  - id: css
    resource: ../../examples/vite/m12/base.css
    title: Application notification, tabs, dialog and focus styles
    git_blob: 7408d0f68eb8e07d7fd718e2d7e84b9f609cee5d
  - id: side-css
    resource: ../../examples/vite/m12/side.css
    title: Application side-menu layout
    git_blob: 0d4734daafff76c1638dc9f703bc48ac99b29f85
  - id: stack-css
    resource: ../../examples/vite/m12/stack.css
    title: Application stacked-menu layout
    git_blob: f632fbcbf0109de715e5051afebf278c26c8162b
  - id: browser
    resource: ../../tests/browser/m12-shell.spec.ts
    title: Shell integration, lifetime, keyboard and axe checks
    git_blob: 05cc5fcdbaebcc532d435325845e9d633c6173dc
generated: { by: codex/gpt-6, at: 2026-10-05T08:49:05Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T08:49:05Z }
---

The shell is application composition, with no public framework shell class. One editor PageDefinition runs in main content, dynamic Documents and native Popup. Each shell CVC controller owns its own Rows, notification region, document binder and page handles; the two starting workspaces are independent.[^controller]

# Scenario

Run npm run build and npm run example, then open /m12/side.html or /m12/stack.html. Open Ada and Lin documents, switch with arrows and Enter, edit a nested name or formatted salary, validate, open the Popup, reload a document, revert shared changes and close documents/workspaces. The side view places menu/main/documents next to each other; the stacked view places documents before the main editor.[^controller][^side][^stack]

# Components used

| API | Responsibility |
|---|---|
| mountPage | One shell controller per instance and one editor controller per page mount; cancellation and reverse-order ownership. |
| createRows | Two employees per shell, nested profile.name, raw numeric salary and stable RowIds. |
| bindForm | Edit the same record in main/document/Popup; retain native validation and comma/number rules. |
| bindDocuments | Keyed retained pages, manual keyboard activation, reload, close guard, failed-page retry and cleanup. |
| bindNotify | Persistent plain-text messages in one shell-owned region; explicit clear/dismiss. |
| openPopup | Editor input/result in an authored dialog with opener restoration. |

# View

Both layouts supply data-document-items outside the named tablist. The binder preserves each tab/close sibling wrapper in this host and gives the tablist aria-owns references to generated tab IDs only. Close buttons remain named native controls outside that ARIA ownership. The authored templates have no fixed repeated IDs.

# Controller

| Change | Start here |
|---|---|
| Editor fields, parse/validation or output | EditorInput, editor definition and data-editor-form in main.ts and the HTML template. |
| Document titles/factory/input | pages declaration inside the shell controller. |
| Business dirty-close policy | beforeClose callback uses Rows.changes() and native window.confirm. |
| Routing/menu choices | Application data-open-document controls and their explicit event handlers. |
| Shell disposal | own callbacks inside the shell controller and outer workspace close/pagehide paths. |
| Visual appearance | Authored HTML, base.css and the selected layout CSS; framework source has no theme. |

Use data-field rather than fixed DOM IDs in repeated editor templates. Each Form creates its own accessible error references. Document tab/panel IDs and notification descriptions are generated only for their respective ARIA connections.[^controller][^side][^stack]

# How it works

Reopening a key keeps the editor controller and entered/shared data. Switching deactivates the prior document, while reactivation resumes it. Reload uses a fresh controller from the original descriptor and retains caller-owned Rows. Dirty close confirmation is application code; refusing it leaves the document intact. Close all is an explicit loop that stops on a refused close. Validation reports that changes are ready for an application save; this example does not claim server persistence.[^controller]

Retry intentionally fails the first initialization and succeeds when the same key is opened again. Pending intentionally never finishes init; selecting another document or closing it exercises the existing page runtime's cancellation. Errors announce through the shell-owned urgent notification and the authored document alert. Closing a workspace releases its page, form, notification and row resources; it does not disturb another shell.[^controller][^browser]

## Browser checks

```sh
npx playwright test -c tests/playwright.config.ts tests/browser/m12-shell.spec.ts --project chromium
```

Run Firefox and WebKit too for the required final gates. The integration suite covers both layouts: controller retention/new reload instance, main/document/Popup sharing, native guarded close, retry, never-ending init cancellation, repeated workspace release, persistent notifications, unique IDs, keyboard focus and automated accessibility at narrow width/text spacing.[^browser]

# Pitfalls

Application Rows persist above individual document controllers. Closing a dirty document after confirmation leaves those shared changes in the shell; explicit Revert resets them. Invalid Form drafts need validation before sending business data. Reload does not run the close guard; applications should confirm it when page-local state would be lost.[^controller]

This example uses native confirm rather than defining a framework confirmation component. It owns pagehide/MutationObserver/listeners and outputs explicitly. Notification and history DOM are illustrative application state, not a new data engine. Automated axe and keyboard tests do not establish manual assistive-technology conformance.[^controller][^browser]

# Related

[Documents](documents.md), [Notify](notify.md), [Form](form.md), [Rows](data.md), [Popup](popup.md) and [page lifecycle](page.md) define the used APIs. [The M12 plan](../implementation/m12-plan.md) records scope and exact final evidence.

[^controller]: Application shell ownership and shared editor definition
[^side]: Authored side-menu shell layout
[^stack]: Authored stacked-menu shell layout
[^css]: Application notification, tabs, dialog and focus styles
[^side-css]: Application side-menu layout
[^stack-css]: Application stacked-menu layout
[^browser]: Shell integration, lifetime, keyboard and axe checks

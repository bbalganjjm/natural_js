---
type: UI Component
title: bindNotify
description: Bind persistent plain-text notifications and manual dismissal to an authored list and stable announcement regions.
tags: [ui, notification, accessibility]
status: draft
symbols: [bindNotify, NotifyHandle]
sources:
  - id: notify
    resource: ../../src/ui/notify.ts
    title: Notification markup, announcements, focus and cleanup
    git_blob: 78af2890f980c0091246e81abd2a041b084bc30f
  - id: dom
    resource: ../../src/ui/dom-state.ts
    title: Private attribute restoration and document-unique IDs
    git_blob: 2bd585b3b9e31503e31499474db0e2ffbb3d79fb
  - id: browser
    resource: ../../tests/browser/notify.spec.ts
    title: Notification browser checks
    git_blob: f8cb8b10e94e88e719df4f0f1063c5d45d12238b
generated: { by: codex/gpt-6, at: 2026-10-05T08:49:05Z }
verified:
  - { by: codex/gpt-6, at: 2026-10-05T08:49:05Z }
---

bindNotify attaches message insertion, dismissal and accessible state to caller-authored HTML. Each binding owns only its cloned items and announcement changes. There is no global notification singleton, design, timer or URL action.[^notify]

# Quick start

```html
<section data-notify aria-label="Notifications">
  <ol data-notify-list>
    <li data-notify-template>
      <span data-notify-message></span>
      <button type="button" data-notify-close>Dismiss</button>
    </li>
  </ol>
  <p class="visually-hidden" data-notify-status role="status"></p>
  <p class="visually-hidden" data-notify-alert role="alert"></p>
</section>
```

```ts
import { bindNotify } from "@bbalganjjm/natural_js/ui";
const root = document.querySelector<HTMLElement>("[data-notify]")!;
const notifications = bindNotify(root);
const dismiss = notifications.show("Saved.");
notifications.show("Save failed.", { urgent: true });
dismiss();
notifications.clear();
notifications.dispose();
```

The application supplies visually-hidden CSS that keeps the announcement elements available. Do not use hidden, inert, aria-hidden, display:none or visibility:hidden on these elements or their ancestors.[^notify]

# Constructor

bindNotify(root: HTMLElement): NotifyHandle requires a connected data-notify root named by aria-label or distinct existing aria-labelledby IDs. Its role must be absent or region. One ul/ol[data-notify-list] contains only one direct li[data-notify-template]. The template contains one text-only data-notify-message and optionally one named native button[type=button][data-notify-close]. Separate data-notify-status[role=status] and data-notify-alert[role=alert] elements stay outside that list. Nested notification roots within the repeated template, fixed repeated IDs and additional interactive controls are rejected before mutation. Live semantics on the root/list/template are rejected; only the two stable announcement elements should announce messages.[^notify]

# Methods

| Member | Behavior |
|---|---|
| show(message: string, options?: { urgent?: boolean }): () => void | Adds one cloned item with nonempty plain text; false/absent urgent announces politely, true uses the assertive region. Returns an idempotent dismissal function. |
| clear(): void | Removes owned items and clears both announcement regions. |
| dispose(): void | Removes listeners/items, restores the original template, attributes and announcement nodes, and releases ownership. Repeated disposal is safe. |

show and clear after disposal raise NOTIFY_DISPOSED. A retained dismissal function becomes a safe no-op after disposal. Invalid message/options raise NOTIFY_MESSAGE; invalid markup/names/ownership use NOTIFY_ROOT, NOTIFY_MARKUP, NOTIFY_NAME or NOTIFY_OWNED. Repeated/colliding authored IDs use DUPLICATE_ID. All errors identify api bindNotify.[^notify]

# Behavior

The binder detaches the original item template once, caches its message/close node positions, and clones it per show call. Message content is written as text, including strings that look like HTML. Generated message IDs connect each optional close button's description to its message and are document-unique.[^notify][^dom]

Stable regions have aria-live polite/assertive and aria-atomic true. Updating a channel inserts a fresh text node even when a message repeats. Visible message items do not have live semantics, avoiding a second announcement from the list. Dismissing the last announced item clears that channel; it does not reannounce older messages. New messages never take keyboard focus.[^notify]

Removing a focused item chooses the following available close control, then a preceding one, then the named notification region. clear/dispose move focus to the region only when an owned item contained focus. Unrelated focus stays in place. The application owns visibility, placement, styling and message persistence; no item expires automatically.[^notify]

# Pitfalls

The template must be available and not hidden; binding replaces it with an internal position anchor. Use an outer application HTML template when assembling multiple screens. The two announcement regions can be visually hidden using application CSS but remain available to assistive technology. Urgent messages should be reserved for application conditions requiring interruption; there is no message-category registry or translation system.[^notify]

Notification actions and navigation belong to application controls. Use normal native links/buttons outside the notification template when a task needs an action. Automation checks DOM/keyboard behavior and tested accessibility states; manual assistive-technology review remains open.[^browser]

# Related

[Documents](documents.md) provides dynamic CVC page containers. [The shell example](shell-example.md) composes both binders with Form, Rows and Popup. [UI contracts](ui.md) lists the public entry.

[^notify]: Notification markup, announcements, focus and cleanup
[^dom]: Private attribute restoration and document-unique IDs
[^browser]: Notification browser checks

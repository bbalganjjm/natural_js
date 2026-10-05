// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { restoreAttributes, uniqueId } from "./dom-state.js";

export interface NotifyHandle {
  show(message: string, options?: { urgent?: boolean }): () => void;
  clear(): void;
  dispose(): void;
}

interface Entry {
  readonly element: HTMLLIElement;
  readonly close?: HTMLButtonElement;
  readonly channel: HTMLElement;
}

const boundRoots = new WeakSet<HTMLElement>();

function notifyError(code: string, message: string): FrameworkError {
  return new FrameworkError({ api: "bindNotify", code, message });
}

export function bindNotify(root: HTMLElement): NotifyHandle {
  if (!(root instanceof HTMLElement) || !root.matches("[data-notify]") || !root.isConnected) {
    throw notifyError("NOTIFY_ROOT", "Notifications need a connected authored data-notify region.");
  }
  if (boundRoots.has(root)) throw notifyError("NOTIFY_OWNED", "This notification region is already bound.");
  if (root.hasAttribute("role") && root.getAttribute("role") !== "region") {
    throw notifyError("NOTIFY_ROOT", "The notification root cannot have a different role.");
  }
  function owned(selector: string): HTMLElement[] {
    return [...root.querySelectorAll<HTMLElement>(selector)]
      .filter(element => element.closest("[data-notify]") === root);
  }
  const lists = owned("[data-notify-list]");
  const templates = owned("li[data-notify-template]");
  const statuses = owned("[data-notify-status]");
  const alerts = owned("[data-notify-alert]");
  const list = lists[0];
  const template = templates[0];
  const status = statuses[0];
  const alert = alerts[0];
  if (lists.length !== 1 || !(list instanceof HTMLUListElement || list instanceof HTMLOListElement) ||
      templates.length !== 1 || !(template instanceof HTMLLIElement) || template.parentElement !== list ||
      list.children.length !== 1 || statuses.length !== 1 || alerts.length !== 1 || status === alert ||
      status.getAttribute("role") !== "status" || alert.getAttribute("role") !== "alert" ||
      list.contains(status) || list.contains(alert) || status.contains(list) || alert.contains(list) ||
      status.contains(alert) || alert.contains(status) ||
      (list.hasAttribute("role") && list.getAttribute("role") !== "list") ||
      (template.hasAttribute("role") && template.getAttribute("role") !== "listitem")) {
    throw notifyError("NOTIFY_MARKUP", "Use one ul or ol item template and separate stable status and alert elements outside the list.");
  }
  for (const live of [status, alert]) {
    if (live.closest('[hidden], [inert], [aria-hidden="true"]')) {
      throw notifyError("NOTIFY_MARKUP", "Notification announcement elements must remain available to assistive technology.");
    }
    for (let parent: HTMLElement | null = live; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") {
        throw notifyError("NOTIFY_MARKUP", "Hide announcement elements visually with CSS, without display:none or visibility:hidden.");
      }
    }
  }
  const authored = [template, ...template.querySelectorAll<HTMLElement>("*")];
  const messages = [...template.querySelectorAll<HTMLElement>("[data-notify-message]")];
  const closes = [...template.querySelectorAll<HTMLElement>("[data-notify-close]")];
  const message = messages[0];
  const close = closes[0];
  if (messages.length !== 1 || message.children.length || closes.length > 1 ||
      (close && (!(close instanceof HTMLButtonElement) || close.type !== "button" ||
        message.contains(close) || close.contains(message))) ||
      template.querySelector("[data-notify]") ||
      [template, message, ...(close ? [close] : [])].some(element =>
        element.closest('[hidden], [inert], [aria-hidden="true"]'))) {
    throw notifyError("NOTIFY_MARKUP", "An item needs one available text-only message and an optional named type=button close control.");
  }
  if (template.hasAttribute("id") || template.querySelector("[id]")) {
    throw notifyError("DUPLICATE_ID", "A repeated notification template cannot contain fixed DOM ids.");
  }
  const interactive = template.querySelectorAll<HTMLElement>(
    'a[href], area[href], button, input, select, textarea, summary, iframe, audio[controls], video[controls], [tabindex], [contenteditable]:not([contenteditable="false"])'
  );
  if ([...interactive].some(element => element !== close)) {
    throw notifyError("NOTIFY_MARKUP", "A notification item accepts only its optional close button as an interactive control.");
  }
  const extraLive = [root, list, ...authored];
  if (extraLive.some(element =>
    (element.hasAttribute("aria-live") && element.getAttribute("aria-live") !== "off") ||
    ["alert", "status"].includes(element.getAttribute("role") ?? ""))) {
    throw notifyError("NOTIFY_MARKUP", "Only the stable notification status and alert elements should announce messages.");
  }
  const document = root.ownerDocument;
  const ids = new Set<string>();
  for (const element of [root, ...root.querySelectorAll<HTMLElement>("[id]")]) {
    if (!element.id) continue;
    if (ids.has(element.id)) throw notifyError("DUPLICATE_ID", "Notifications repeat an authored DOM id.");
    ids.add(element.id);
  }
  const counts = new Map<string, number>();
  for (const element of document.querySelectorAll("[id]")) {
    counts.set(element.id, (counts.get(element.id) ?? 0) + 1);
    if (!root.contains(element) && ids.has(element.id)) {
      throw notifyError("DUPLICATE_ID", "A notification DOM id already exists in the document.");
    }
  }
  function labelled(element: Element, text = false): boolean {
    const names = (element.getAttribute("aria-labelledby") ?? "").trim().split(/\s+/).filter(Boolean);
    if (names.length && (new Set(names).size !== names.length || names.some(id => counts.get(id) !== 1))) {
      throw notifyError("NOTIFY_NAME", "Notification labels must reference distinct existing DOM ids.");
    }
    if (names.length || element.getAttribute("aria-label")?.trim()) return true;
    if (!text) return false;
    const visible = element.cloneNode(true) as Element;
    for (const hidden of visible.querySelectorAll('[hidden], [inert], [aria-hidden="true"]')) hidden.remove();
    return !!visible.textContent?.trim() || [...visible.querySelectorAll("img[alt]")]
      .some(image => !!image.getAttribute("alt")?.trim());
  }
  if (!labelled(root) || (close && !labelled(close, true))) {
    throw notifyError("NOTIFY_NAME", "The notification region and its close control need accessible names.");
  }
  const messageIndex = authored.indexOf(message);
  const closeIndex = close ? authored.indexOf(close) : -1;
  const restore = [restoreAttributes(root, ["role", "tabindex"]),
    restoreAttributes(status, ["aria-live", "aria-atomic"]), restoreAttributes(alert, ["aria-live", "aria-atomic"])];
  const originalStatus = [...status.childNodes];
  const originalAlert = [...alert.childNodes];
  const anchor = document.createComment("notification items");
  const entries = new Map<HTMLLIElement, Entry>();
  const byClose = new WeakMap<HTMLButtonElement, Entry>();
  const announced = new Map<HTMLElement, Entry>();
  let disposed = false;

  function active(): void {
    if (disposed) throw notifyError("NOTIFY_DISPOSED", "This notification region has been disposed.");
  }
  function focusRoot(): void {
    if (!root.hasAttribute("tabindex")) root.tabIndex = -1;
    root.focus({ preventScroll: true });
  }
  function dismiss(entry: Entry): void {
    if (!entries.has(entry.element)) return;
    const focused = entry.element.contains(document.activeElement);
    const siblings = [...entries.values()];
    const index = siblings.indexOf(entry);
    entries.delete(entry.element);
    entry.element.remove();
    if (announced.get(entry.channel) === entry) {
      entry.channel.replaceChildren();
      announced.delete(entry.channel);
    }
    if (!focused) return;
    const next = [...siblings.slice(index + 1), ...siblings.slice(0, index).reverse()]
      .map(item => item.close).find(button => button?.isConnected && !button.disabled &&
        !button.closest('[hidden], [inert], [aria-hidden="true"]') &&
        getComputedStyle(button).visibility === "visible" && button.getClientRects().length > 0);
    if (next) next.focus({ preventScroll: true });
    else focusRoot();
  }
  function clear(): void {
    const focused = [...entries.values()].some(entry => entry.element.contains(document.activeElement));
    for (const entry of entries.values()) entry.element.remove();
    entries.clear();
    announced.clear();
    status.replaceChildren();
    alert.replaceChildren();
    if (focused) focusRoot();
  }
  function onClick(event: MouseEvent): void {
    const button = event.target instanceof Element ? event.target.closest("[data-notify-close]") : null;
    if (!(button instanceof HTMLButtonElement) || button.disabled) return;
    const entry = byClose.get(button);
    if (entry) dismiss(entry);
  }

  root.setAttribute("role", "region");
  status.setAttribute("aria-live", "polite");
  alert.setAttribute("aria-live", "assertive");
  for (const live of [status, alert]) { live.setAttribute("aria-atomic", "true"); live.replaceChildren(); }
  template.replaceWith(anchor);
  root.addEventListener("click", onClick);
  boundRoots.add(root);
  return {
    show(text, options = {}) {
      active();
      if (typeof text !== "string" || !text.trim() || !options || typeof options !== "object" ||
          Array.isArray(options) || (options.urgent !== undefined && typeof options.urgent !== "boolean")) {
        throw notifyError("NOTIFY_MESSAGE", "Show a nonempty plain-text message with an optional urgent boolean.");
      }
      const element = template.cloneNode(true) as HTMLLIElement;
      element.removeAttribute("data-notify-template");
      const nodes = [element, ...element.querySelectorAll<HTMLElement>("*")];
      const message = nodes[messageIndex];
      const close = closeIndex < 0 ? undefined : nodes[closeIndex] as HTMLButtonElement;
      message.textContent = text;
      if (close) {
        message.id = uniqueId(document, "njs-notify-message");
        const described = new Set((close.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean));
        described.add(message.id);
        close.setAttribute("aria-describedby", [...described].join(" "));
      }
      const channel = options.urgent ? alert : status;
      const entry = { element, close, channel };
      entries.set(element, entry);
      if (close) byClose.set(close, entry);
      anchor.before(element);
      announced.set(channel, entry);
      channel.replaceChildren(document.createTextNode(text));
      return () => { if (!disposed) dismiss(entry); };
    },
    clear() { active(); clear(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      root.removeEventListener("click", onClick);
      clear();
      anchor.replaceWith(template);
      status.replaceChildren(...originalStatus);
      alert.replaceChildren(...originalAlert);
      for (const original of restore.reverse()) original();
      boundRoots.delete(root);
    }
  };
}

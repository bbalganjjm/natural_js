// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { restoreAttributes, uniqueId } from "./dom-state.js";
import { createTabPages, nextTab, panelHasFocusTarget, tabAbort } from "./tab-pages.js";
import type { TabPage } from "./tab-pages.js";

export interface DocumentHandle {
  open(key: string, document: { title: string; page(host: HTMLElement): TabPage }): Promise<void>;
  select(key: string): Promise<void>;
  selected(): string | null;
  keys(): readonly string[];
  close(key: string): Promise<boolean>;
  reload(key: string): Promise<void>;
  dispose(): Promise<void>;
}

interface DocumentTab {
  readonly key: string;
  readonly wrapper: HTMLElement;
  readonly button: HTMLButtonElement;
  readonly close: HTMLButtonElement;
  readonly panel: HTMLElement;
  readonly panelTabIndex: string | null;
  readonly page: (host: HTMLElement) => TabPage;
  closing: boolean;
}

const boundRoots = new WeakSet<HTMLElement>();
const interactive = 'a[href], area[href], button, input, select, textarea, summary, iframe, audio[controls], video[controls], [tabindex], [contenteditable]:not([contenteditable="false"])';

function documentError(code: string, message: string, detail?: Record<string, unknown>): FrameworkError {
  return new FrameworkError({ api: "bindDocuments", code, message, detail });
}

export function bindDocuments(root: HTMLElement, options: {
  beforeClose?: (key: string) => boolean | Promise<boolean>;
  errorText?: string;
} = {}): DocumentHandle {
  if (!(root instanceof HTMLElement) || !root.matches("[data-documents]") || !root.isConnected) {
    throw documentError("DOCUMENT_ROOT", "Documents need a connected authored [data-documents] root.");
  }
  if (boundRoots.has(root)) throw documentError("DOCUMENT_OWNED", "This Documents root is already bound.");
  if (!options || typeof options !== "object" ||
      (Object.getPrototypeOf(options) !== Object.prototype && Object.getPrototypeOf(options) !== null) ||
      (options.beforeClose !== undefined && typeof options.beforeClose !== "function") ||
      (options.errorText !== undefined && (typeof options.errorText !== "string" || !options.errorText.trim()))) {
    throw documentError("DOCUMENT_OPTIONS", "Documents need a close guard function and nonempty error text when supplied.");
  }
  const document = root.ownerDocument;
  function one(selector: string): HTMLElement {
    const matches = [...root.querySelectorAll<HTMLElement>(selector)]
      .filter(element => element.closest("[data-documents]") === root);
    if (matches.length !== 1) throw documentError("DOCUMENT_MARKUP", `Documents need one authored ${selector}.`);
    return matches[0];
  }
  const list = one('[role="tablist"]');
  const orientation = list.getAttribute("aria-orientation");
  const items = one("[data-document-items]");
  const panels = one("[data-document-panels]");
  const empty = one("[data-document-empty]");
  const alert = one("[data-document-error]");
  const tabTemplate = one("template[data-document-tab-template]");
  const panelTemplate = one("template[data-document-panel-template]");
  const regions = [list, items, panels, empty, alert];
  const overlapping = regions.some((region, index) => regions.slice(index + 1)
    .some(other => region.contains(other) || other.contains(region)));
  if (!(tabTemplate instanceof HTMLTemplateElement) || !(panelTemplate instanceof HTMLTemplateElement) ||
      !list.contains(tabTemplate) || !panels.contains(panelTemplate) || overlapping ||
      items.childElementCount || items.textContent?.trim() ||
      list.hasAttribute("aria-owns") || (orientation !== null && orientation !== "horizontal" && orientation !== "vertical") ||
      alert.getAttribute("role") !== "alert" ||
      list.querySelector(interactive) || panels.children.length !== 1 || panels.firstElementChild !== panelTemplate ||
      !(list.getAttribute("aria-label")?.trim() || list.getAttribute("aria-labelledby")?.trim())) {
    throw documentError("DOCUMENT_MARKUP", "Documents need a named tablist, separate empty panel container, empty state, and error alert.");
  }
  const ids = new Set<string>();
  for (const element of [root, ...root.querySelectorAll<HTMLElement>("[id]")]) {
    if (!element.id) continue;
    if (ids.has(element.id)) throw documentError("DUPLICATE_ID", "Documents repeat an authored DOM id.", { id: element.id });
    ids.add(element.id);
  }
  const labelIds = list.getAttribute("aria-label")?.trim() ? [] : list.getAttribute("aria-labelledby")!.trim().split(/\s+/);
  const counts = new Map(labelIds.map(id => [id, 0]));
  for (const element of document.querySelectorAll<HTMLElement>("[id]")) {
    if (!root.contains(element) && ids.has(element.id)) {
      throw documentError("DUPLICATE_ID", "A Documents DOM id already exists in the document.", { id: element.id });
    }
    if (counts.has(element.id)) counts.set(element.id, counts.get(element.id)! + 1);
  }
  if (new Set(labelIds).size !== labelIds.length || labelIds.some(id => counts.get(id) !== 1)) {
    throw documentError("DOCUMENT_MARKUP", "Tab list labels must reference distinct existing DOM ids.");
  }
  function templateRoot(template: HTMLTemplateElement): HTMLElement {
    const element = template.content.firstElementChild;
    if (template.content.children.length !== 1 || !(element instanceof HTMLElement) ||
        element.hasAttribute("id") || element.querySelector("[id]") ||
        element.matches("script, iframe, object, embed, template, [data-documents]") ||
        element.querySelector("script, iframe, object, embed, template, [data-documents]")) {
      throw documentError("DOCUMENT_MARKUP", "Each document template needs one HTML root without fixed IDs or executable content.");
    }
    for (const node of [element, ...element.querySelectorAll<HTMLElement>("*")]) {
      if ([...node.attributes].some(attribute => attribute.name.toLowerCase().startsWith("on"))) {
        throw documentError("DOCUMENT_MARKUP", "Document templates cannot contain inline event handlers.");
      }
    }
    return element;
  }
  const tabSource = templateRoot(tabTemplate);
  const panelSource = templateRoot(panelTemplate);
  const sourceTabs = tabSource.querySelectorAll("[data-document-tab]");
  const sourceCloses = tabSource.querySelectorAll("[data-document-close]");
  const sourceTitles = tabSource.querySelectorAll("[data-document-title]");
  const sourceTab = sourceTabs[0];
  const sourceClose = sourceCloses[0];
  const sourceTitle = sourceTitles[0];
  const closeLabelIds = sourceClose?.getAttribute("aria-labelledby")?.trim().split(/\s+/);
  const closeNameValid = closeLabelIds
    ? new Set(closeLabelIds).size === closeLabelIds.length && closeLabelIds.every(id => id &&
      [...document.querySelectorAll<HTMLElement>("[id]")].filter(element => element.id === id).length === 1)
    : Boolean(sourceClose?.getAttribute("aria-label")?.trim() || sourceClose?.textContent?.trim());
  if (tabSource.matches(interactive) || sourceTabs.length !== 1 || sourceCloses.length !== 1 || sourceTitles.length !== 1 ||
      !(sourceTab instanceof HTMLButtonElement) || !(sourceClose instanceof HTMLButtonElement) ||
      !(sourceTitle instanceof HTMLElement) || sourceTab.type !== "button" || sourceClose.type !== "button" ||
      sourceTab.disabled || sourceClose.disabled || sourceTab.getAttribute("role") !== "tab" ||
      sourceTab.parentElement !== sourceClose.parentElement || !sourceTab.contains(sourceTitle) ||
      sourceTitle.matches(interactive) || sourceTitle.childElementCount ||
      tabSource.querySelectorAll(interactive).length !== 2 ||
      !closeNameValid ||
      panelSource.matches(interactive) || panelSource.getAttribute("role") !== "tabpanel" ||
      panelSource.childElementCount || panelSource.textContent?.trim()) {
    throw documentError("DOCUMENT_MARKUP", "The tab template needs sibling tab/close buttons and a title marker; its panel template must be empty.");
  }

  const restore = [restoreAttributes(root, ["tabindex"]), restoreAttributes(list, ["role", "aria-owns", "aria-orientation"])];
  const emptyHidden = empty.hidden;
  const alertHidden = alert.hidden;
  const alertNodes = [...alert.childNodes];
  restore.push(() => { empty.hidden = emptyHidden; alert.hidden = alertHidden; alert.replaceChildren(...alertNodes); });
  const entries = new Map<string, DocumentTab>();
  const closing = new Map<string, Promise<boolean>>();
  const controller = new AbortController();
  let selected: string | null = null;
  let focused: string | null = null;
  let busy = false;
  let disposed = false;
  let disposal: Promise<void> | undefined;

  function showError(show: boolean): void {
    if (disposed) return;
    alert.hidden = !show;
    alert.textContent = show ? options.errorText ?? "Document could not be opened or closed." : "";
  }
  function render(): void {
    if (disposed) return;
    const available = [...entries.values()].filter(entry => !entry.closing);
    if (!focused || !entries.has(focused) || entries.get(focused)!.closing) focused = selected ?? available[0]?.key ?? null;
    list.setAttribute("role", entries.size ? "tablist" : "group");
    if (entries.size) list.setAttribute("aria-owns", [...entries.values()].map(entry => entry.button.id).join(" "));
    else list.removeAttribute("aria-owns");
    if (entries.size && orientation !== null) list.setAttribute("aria-orientation", orientation);
    else list.removeAttribute("aria-orientation");
    empty.hidden = entries.size !== 0;
    for (const entry of entries.values()) {
      const visible = entry.key === selected;
      entry.button.setAttribute("aria-selected", String(visible));
      entry.button.tabIndex = entry.key === focused && !entry.closing ? 0 : -1;
      entry.panel.hidden = !visible;
      if (visible && busy) entry.panel.setAttribute("aria-busy", "true");
      else entry.panel.removeAttribute("aria-busy");
      if (visible && !panelHasFocusTarget(entry.panel)) entry.panel.tabIndex = 0;
      else if (entry.panelTabIndex === null) entry.panel.removeAttribute("tabindex");
      else entry.panel.setAttribute("tabindex", entry.panelTabIndex);
    }
  }
  function focusEmpty(): void {
    const target = [...empty.querySelectorAll<HTMLElement>(interactive)].find(element =>
      element.tabIndex >= 0 && !element.matches(":disabled") &&
      !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
      element.getClientRects().length > 0 && getComputedStyle(element).visibility === "visible");
    if (target) target.focus({ preventScroll: true });
    else {
      if (!root.hasAttribute("tabindex")) root.tabIndex = -1;
      root.focus({ preventScroll: true });
    }
  }
  const pages = createTabPages({
    create(key) { const entry = entries.get(key)!; return entry.page(entry.panel); },
    invalidPage: () => documentError("DOCUMENT_PAGE", "A document factory must return a PageHandle-compatible page."),
    change(key, loading, focus) {
      selected = key;
      busy = loading;
      if (focus) focused = key;
      render();
    },
    moveFocus(previous, next) {
      const oldPanel = previous === null ? undefined : entries.get(previous)?.panel;
      if (oldPanel?.contains(document.activeElement)) entries.get(next)?.button.focus({ preventScroll: true });
    },
    error: showError,
    recovered(failed, restored) {
      if (document.activeElement === entries.get(failed)?.button && restored !== null) {
        entries.get(restored)?.button.focus({ preventScroll: true });
      }
    }
  });
  function requireEntry(key: string): DocumentTab {
    if (disposed) throw documentError("DOCUMENT_DISPOSED", "This Documents binding has been disposed.");
    const entry = entries.get(key);
    if (!entry) throw documentError("DOCUMENT_KEY", "Unknown document key.", { key });
    if (entry.closing) throw documentError("DOCUMENT_CLOSING", "This document is closing.", { key });
    return entry;
  }
  function select(key: string): Promise<void> {
    try { requireEntry(key); } catch (cause) { return Promise.reject(cause); }
    return pages.select(key);
  }
  async function permitted(key: string): Promise<boolean> {
    const signal = controller.signal;
    if (signal.aborted) throw tabAbort();
    let onAbort: () => void = () => {};
    const cancelled = new Promise<never>((_, reject) => {
      onAbort = () => reject(tabAbort());
      signal.addEventListener("abort", onAbort, { once: true });
    });
    try {
      const allow = await Promise.race([Promise.resolve().then(() => options.beforeClose ? options.beforeClose(key) : true), cancelled]);
      if (signal.aborted) throw tabAbort();
      if (typeof allow !== "boolean") throw documentError("DOCUMENT_GUARD", "beforeClose must return a boolean.", { key });
      return allow;
    } finally { signal.removeEventListener("abort", onAbort); }
  }
  function close(key: string): Promise<boolean> {
    if (disposed) return Promise.reject(documentError("DOCUMENT_DISPOSED", "This Documents binding has been disposed."));
    const pending = closing.get(key);
    if (pending) return pending;
    const entry = entries.get(key);
    if (!entry) return Promise.resolve(true);
    const result = Promise.resolve().then(async () => {
      try {
        if (!await permitted(key)) return false;
        if (disposed) throw tabAbort();
        const order = [...entries.values()];
        const index = order.indexOf(entry);
        const adjacent = () => order.slice(index + 1).find(candidate => entries.get(candidate.key) === candidate && !candidate.closing) ??
          order.slice(0, index).reverse().find(candidate => entries.get(candidate.key) === candidate && !candidate.closing);
        const neighbor = adjacent();
        const hadFocus = entry.wrapper.contains(document.activeElement) || entry.panel.contains(document.activeElement);
        const wasSelected = pages.selected() === key || pages.requested() === key;
        entry.closing = true;
        entry.button.disabled = true;
        entry.close.disabled = true;
        if (hadFocus && neighbor) neighbor.button.focus({ preventScroll: true });
        let failed = false;
        let failure: unknown;
        try { await pages.remove(key); } catch (cause) { failed = true; failure = cause; }
        if (disposed) throw tabAbort();
        entries.delete(key);
        entry.wrapper.remove();
        entry.panel.remove();
        render();
        const next = adjacent();
        if (hadFocus && !next) focusEmpty();
        if (wasSelected && pages.requested() === null && next) {
          try { await select(next.key); } catch (cause) {
            if (!failed) { failed = true; failure = cause; }
          }
        }
        if (failed) throw failure;
        return true;
      } catch (cause) { showError(true); throw cause; }
    });
    closing.set(key, result);
    void result.then(() => { closing.delete(key); }, () => { closing.delete(key); });
    return result;
  }

  items.addEventListener("click", event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>("[data-document-tab], [data-document-close]");
    const entry = [...entries.values()].find(candidate => candidate.button === button || candidate.close === button);
    if (!entry || button?.disabled) return;
    if (button === entry.close) void close(entry.key).catch(() => {});
    else { focused = entry.key; render(); void select(entry.key).catch(() => {}); }
  }, { signal: controller.signal });
  items.addEventListener("keydown", event => {
    const entry = [...entries.values()].find(candidate => candidate.button === event.target);
    if (!entry || entry.button.disabled) return;
    const next = nextTab([...entries.values()], entry.button, event.key, orientation === "vertical");
    if (next) {
      event.preventDefault(); focused = next.key; render(); next.button.focus({ preventScroll: true });
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); void select(entry.key).catch(() => {});
    } else if (event.key === "Delete") {
      event.preventDefault(); void close(entry.key).catch(() => {});
    }
  }, { signal: controller.signal });
  items.addEventListener("focusin", event => {
    const entry = [...entries.values()].find(candidate => candidate.button === event.target);
    if (!entry || entry.button.disabled) return;
    focused = entry.key; render();
  }, { signal: controller.signal });
  items.addEventListener("focusout", event => {
    if (event.relatedTarget instanceof Node && items.contains(event.relatedTarget)) return;
    focused = selected ?? entries.keys().next().value ?? null; render();
  }, { signal: controller.signal });
  boundRoots.add(root);
  showError(false);
  render();
  return {
    open(key, descriptor) {
      if (disposed) return Promise.reject(documentError("DOCUMENT_DISPOSED", "This Documents binding has been disposed."));
      if (typeof key !== "string" || !key.trim()) return Promise.reject(documentError("DOCUMENT_KEY", "Document keys must be nonempty strings."));
      if (entries.has(key)) return select(key);
      if (!descriptor || typeof descriptor.title !== "string" || !descriptor.title.trim() || typeof descriptor.page !== "function") {
        return Promise.reject(documentError("DOCUMENT_OPTIONS", "A new document needs a title and page factory."));
      }
      const wrapper = tabSource.cloneNode(true) as HTMLElement;
      const button = wrapper.querySelector<HTMLButtonElement>("[data-document-tab]")!;
      const title = wrapper.querySelector<HTMLElement>("[data-document-title]")!;
      const closeButton = wrapper.querySelector<HTMLButtonElement>("[data-document-close]")!;
      const panel = panelSource.cloneNode(true) as HTMLElement;
      button.id = uniqueId(document, "njs-document-tab");
      panel.id = uniqueId(document, "njs-document-panel");
      title.id = uniqueId(document, "njs-document-title");
      title.textContent = descriptor.title;
      button.setAttribute("aria-labelledby", title.id);
      button.setAttribute("aria-controls", panel.id);
      panel.setAttribute("aria-labelledby", button.id);
      closeButton.setAttribute("aria-describedby", title.id);
      const entry = { key, wrapper, button, close: closeButton, panel, page: descriptor.page,
        panelTabIndex: panel.getAttribute("tabindex"), closing: false };
      entries.set(key, entry);
      items.append(wrapper);
      panels.append(panel);
      render();
      return select(key);
    },
    select,
    selected: () => selected,
    keys: () => [...entries.keys()],
    close,
    reload(key) {
      try { requireEntry(key); } catch (cause) { return Promise.reject(cause); }
      return pages.reload(key);
    },
    dispose() {
      if (disposal) return disposal;
      disposed = true;
      controller.abort();
      disposal = pages.dispose().finally(() => {
        for (const entry of entries.values()) { entry.wrapper.remove(); entry.panel.remove(); }
        entries.clear(); closing.clear(); selected = focused = null;
        for (const undo of restore.reverse()) undo();
        boundRoots.delete(root);
      });
      return disposal;
    }
  };
}

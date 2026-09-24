// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { PageHandle } from "../page/index.js";

type TabPage = Pick<PageHandle, "ready" | "activate" | "deactivate" | "dispose">;

export interface TabHandle {
  readonly ready: Promise<void>;
  selected(): string | null;
  select(key: string): Promise<void>;
  dispose(): Promise<void>;
}

interface Tab {
  readonly key: string;
  readonly button: HTMLButtonElement;
  readonly panel: HTMLElement;
}

const boundRoots = new WeakSet<HTMLElement>();
let nextId = 0;

function tabError(code: string, message: string, detail?: Record<string, unknown>): FrameworkError {
  return new FrameworkError({ api: "bindTabs", code, message, detail });
}

function aborted(): DOMException {
  return new DOMException("Tab operation aborted", "AbortError");
}

function owned(root: HTMLElement, selector: string): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(selector)].filter(element => element.closest("[data-tabs]") === root);
}

function attribute(element: Element, name: string): () => void {
  const original = element.getAttribute(name);
  return () => {
    if (original === null) element.removeAttribute(name);
    else element.setAttribute(name, original);
  };
}

function focusable(panel: HTMLElement): boolean {
  return [...panel.querySelectorAll<HTMLElement>(
    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex], [contenteditable]:not([contenteditable="false"])'
  )].some(element => element.tabIndex >= 0 && !element.closest("[hidden]") && !element.closest("[inert]"));
}

export function bindTabs(root: HTMLElement, options: {
  initial: string;
  pages: Record<string, (host: HTMLElement) => TabPage>;
  errorText?: string;
}): TabHandle {
  if (!(root instanceof HTMLElement) || !root.matches("[data-tabs]")) {
    throw tabError("TAB_ROOT", "Tabs need an authored [data-tabs] HTML element.");
  }
  if (boundRoots.has(root)) throw tabError("TAB_OWNED", "This Tabs root is already bound.");
  if (!root.isConnected) throw tabError("TAB_ROOT", "The Tabs root must be connected before binding.");
  const lists = owned(root, '[role="tablist"]');
  if (lists.length !== 1 ||
      !(lists[0].getAttribute("aria-label")?.trim() || lists[0].getAttribute("aria-labelledby")?.trim())) {
    throw tabError("TAB_MARKUP", "Tabs need one named [role=tablist].");
  }
  const list = lists[0];
  const buttons = owned(root, "[data-tab]");
  const panels = owned(root, "[data-panel]");
  const alerts = owned(root, "[data-tab-error]");
  if (!buttons.length || buttons.length !== panels.length || alerts.length !== 1 ||
      alerts[0].getAttribute("role") !== "alert") {
    throw tabError("TAB_MARKUP", "Tabs need paired buttons, panels, and one [data-tab-error][role=alert].");
  }
  if (!options || typeof options.pages !== "object" || options.pages === null ||
      typeof options.initial !== "string" ||
      (options.errorText !== undefined && (typeof options.errorText !== "string" || !options.errorText.trim()))) {
    throw tabError("TAB_OPTIONS", "Tabs need an initial key and page factories.");
  }
  const panelByKey = new Map<string, HTMLElement>();
  for (const panel of panels) {
    const key = panel.getAttribute("data-panel");
    if (!key?.trim() || panelByKey.has(key) || panel.getAttribute("role") !== "tabpanel" || list.contains(panel)) {
      throw tabError("TAB_MARKUP", "Each [data-panel] needs a unique key and role=tabpanel.");
    }
    panelByKey.set(key, panel);
  }
  const tabs: Tab[] = [];
  const tabByKey = new Map<string, Tab>();
  for (const element of buttons) {
    const key = element.getAttribute("data-tab");
    if (!(element instanceof HTMLButtonElement) || element.type !== "button" ||
        element.getAttribute("role") !== "tab" || !list.contains(element) ||
        !key?.trim() || tabByKey.has(key) || !panelByKey.has(key) ||
        !Object.hasOwn(options.pages, key) || typeof options.pages[key] !== "function") {
      throw tabError("TAB_MARKUP", "Each [data-tab] needs a unique keyed button, panel, and page factory.");
    }
    const tab = { key, button: element, panel: panelByKey.get(key)! };
    tabs.push(tab);
    tabByKey.set(key, tab);
  }
  if (Object.keys(options.pages).length !== tabs.length || !tabByKey.has(options.initial) ||
      tabByKey.get(options.initial)!.button.disabled) {
    throw tabError("TAB_OPTIONS", "Initial and page keys must match enabled authored tabs.");
  }

  const document = root.ownerDocument;
  const authoredIds = new Set<string>();
  for (const element of [root, ...root.querySelectorAll<HTMLElement>("[id]")]) {
    if (!element.id) continue;
    if (authoredIds.has(element.id)) throw tabError("DUPLICATE_ID", "Tabs repeat an authored DOM id.", { id: element.id });
    authoredIds.add(element.id);
  }
  const labelIds = list.getAttribute("aria-label")?.trim() ? [] :
    list.getAttribute("aria-labelledby")!.trim().split(/\s+/);
  const labelCounts = new Map(labelIds.map(id => [id, 0]));
  for (const element of document.querySelectorAll<Element>("[id]")) {
    if (!root.contains(element) && authoredIds.has(element.id)) {
      throw tabError("DUPLICATE_ID", "A Tabs DOM id already exists in the document.", { id: element.id });
    }
    if (labelCounts.has(element.id)) labelCounts.set(element.id, labelCounts.get(element.id)! + 1);
  }
  if (new Set(labelIds).size !== labelIds.length || labelIds.some(id => labelCounts.get(id) !== 1)) {
    throw tabError("TAB_MARKUP", "Tab list aria-labelledby must reference distinct existing DOM ids.");
  }
  const restore: Array<() => void> = [];
  function uniqueId(): string {
    let id: string;
    do { id = `njs-tab-${++nextId}`; }
    while (authoredIds.has(id) || document.getElementById(id));
    authoredIds.add(id);
    return id;
  }
  for (const tab of tabs) {
    for (const element of [tab.button, tab.panel]) {
      if (!element.id) {
        restore.push(attribute(element, "id"));
        element.id = uniqueId();
      }
    }
    restore.push(attribute(tab.button, "aria-controls"), attribute(tab.button, "aria-selected"),
      attribute(tab.button, "tabindex"), attribute(tab.panel, "aria-labelledby"),
      attribute(tab.panel, "aria-busy"), attribute(tab.panel, "tabindex"));
    const hidden = tab.panel.hidden;
    restore.push(() => { tab.panel.hidden = hidden; });
    tab.button.setAttribute("aria-controls", tab.panel.id);
    tab.panel.setAttribute("aria-labelledby", tab.button.id);
  }
  const alert = alerts[0];
  const alertText = alert.textContent;
  const alertHidden = alert.hidden;
  restore.push(() => { alert.textContent = alertText; alert.hidden = alertHidden; });
  restore.push(attribute(root, "tabindex"));
  const panelTabIndex = new Map(tabs.map(tab => [tab.panel, tab.panel.getAttribute("tabindex")] as const));

  const cache = new Map<string, TabPage>();
  const controller = new AbortController();
  let selectedKey: string | null = null;
  let stableKey: string | null = null;
  let activeKey: string | null = null;
  let focusedKey = options.initial;
  let busy = false;
  let disposed = false;
  let revision = 0;
  let inFlight: TabPage | null = null;
  let deactivating: TabPage | null = null;
  let tail = Promise.resolve();
  let disposal: Promise<void> | null = null;
  boundRoots.add(root);

  function render(): void {
    const roving = tabByKey.get(focusedKey)?.button.disabled
      ? tabs.find(tab => !tab.button.disabled)?.key : focusedKey;
    for (const tab of tabs) {
      const selected = tab.key === selectedKey;
      tab.button.setAttribute("aria-selected", String(selected));
      tab.button.tabIndex = tab.key === roving ? 0 : -1;
      tab.panel.hidden = !selected;
      if (selected && busy) tab.panel.setAttribute("aria-busy", "true");
      else tab.panel.removeAttribute("aria-busy");
      if (selected && !focusable(tab.panel)) tab.panel.tabIndex = 0;
      else {
        const authored = panelTabIndex.get(tab.panel);
        if (authored === null) tab.panel.removeAttribute("tabindex");
        else if (authored !== undefined) tab.panel.setAttribute("tabindex", authored);
      }
    }
  }

  function moveFocus(oldKey: string | null, nextKey: string): void {
    const oldPanel = oldKey === null ? null : tabByKey.get(oldKey)?.panel;
    const focused = document.activeElement;
    if (!oldPanel || !focused || !oldPanel.contains(focused)) return;
    const button = tabByKey.get(nextKey)?.button;
    const fallback = button?.isConnected && !button.disabled ? button :
      tabs.find(tab => tab.button.isConnected && !tab.button.disabled)?.button;
    if (fallback) fallback.focus({ preventScroll: true });
    else {
      if (!root.hasAttribute("tabindex")) root.tabIndex = -1;
      root.focus({ preventScroll: true });
    }
  }

  async function evict(key: string, page: TabPage): Promise<void> {
    if (cache.get(key) === page) cache.delete(key);
    if (inFlight === page) inFlight = null;
    if (activeKey === key) activeKey = null;
    if (stableKey === key) stableKey = null;
    await page.dispose();
  }

  function stale(expected: number): boolean {
    return disposed || revision !== expected;
  }

  async function transition(key: string, expected: number): Promise<void> {
    if (stale(expected)) throw aborted();
    const previous = stableKey;
    if (activeKey === key && selectedKey === key) return;
    if (activeKey !== null && activeKey !== key) {
      moveFocus(selectedKey, key);
      const oldKey = activeKey;
      const oldPage = cache.get(oldKey)!;
      deactivating = oldPage;
      try {
        await oldPage.deactivate();
      } catch (cause) {
        try { await evict(oldKey, oldPage); } catch { /* Keep the original lifecycle error. */ }
        if (stale(expected)) throw aborted();
        selectedKey = null;
        busy = false;
        render();
        alert.textContent = options.errorText ?? "Tab could not be opened.";
        alert.hidden = false;
        throw cause;
      } finally {
        if (deactivating === oldPage) deactivating = null;
      }
      activeKey = null;
    }
    if (stale(expected)) throw aborted();

    moveFocus(selectedKey, key);
    selectedKey = key;
    focusedKey = key;
    busy = true;
    alert.hidden = true;
    alert.textContent = "";
    render();
    let target = cache.get(key);
    try {
      if (target) {
        inFlight = target;
        await target.activate();
      } else {
        target = options.pages[key](tabByKey.get(key)!.panel);
        if (!target || typeof target.activate !== "function" || typeof target.deactivate !== "function" ||
            typeof target.dispose !== "function" || typeof target.ready?.then !== "function") {
          throw tabError("TAB_PAGE", "A Tab page factory must return a PageHandle-compatible page.");
        }
        cache.set(key, target);
        inFlight = target;
        await target.ready;
      }
      if (stale(expected)) throw aborted();
      inFlight = null;
      activeKey = key;
      stableKey = key;
      busy = false;
      render();
      return;
    } catch (cause) {
      if (target) {
        try { await evict(key, target); } catch { /* The page rejection remains primary. */ }
      }
      if (stale(expected)) throw aborted();
      const previousPage = previous === null || previous === key ? null : cache.get(previous);
      if (previousPage) {
        const restoreKey = previous!;
        selectedKey = restoreKey;
        focusedKey = restoreKey;
        busy = true;
        render();
        inFlight = previousPage;
        try {
          await previousPage.activate();
          if (stale(expected)) throw aborted();
          activeKey = restoreKey;
          stableKey = restoreKey;
        } catch {
          try { await evict(restoreKey, previousPage); } catch { /* Keep the failed target error. */ }
          if (stale(expected)) throw aborted();
          selectedKey = null;
          stableKey = null;
        } finally {
          if (inFlight === previousPage) inFlight = null;
        }
      } else {
        selectedKey = null;
        stableKey = null;
      }
      busy = false;
      render();
      alert.textContent = options.errorText ?? "Tab could not be opened.";
      alert.hidden = false;
      if (document.activeElement === tabByKey.get(key)?.button && stableKey !== null) {
        tabByKey.get(stableKey)?.button.focus({ preventScroll: true });
      }
      throw cause;
    }
  }

  function select(key: string): Promise<void> {
    if (disposed) return Promise.reject(tabError("TAB_DISPOSED", "This Tabs binding has been disposed."));
    const tab = tabByKey.get(key);
    if (!tab) return Promise.reject(tabError("TAB_KEY", "Unknown Tab key.", { key }));
    if (tab.button.disabled) return Promise.reject(tabError("TAB_DISABLED", "A disabled Tab cannot be selected.", { key }));
    const expected = ++revision;
    if (inFlight) void inFlight.dispose().catch(() => {});
    const result = tail.then(() => transition(key, expected));
    tail = result.then(() => {}, () => {});
    return result;
  }

  function onClick(event: MouseEvent): void {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>("[data-tab]");
    if (!button || !list.contains(button) || button.disabled ||
        tabByKey.get(button.getAttribute("data-tab") ?? "")?.button !== button) return;
    const key = button.getAttribute("data-tab")!;
    focusedKey = key;
    render();
    void select(key).catch(() => {});
  }

  function onKeydown(event: KeyboardEvent): void {
    const button = event.target;
    if (!(button instanceof HTMLButtonElement) ||
        tabByKey.get(button.getAttribute("data-tab") ?? "")?.button !== button ||
        button.disabled) return;
    const current = tabs.findIndex(tab => tab.button === button);
    const enabled = tabs.filter(tab => !tab.button.disabled && tab.button.isConnected);
    if (!enabled.length) return;
    const vertical = list.getAttribute("aria-orientation") === "vertical";
    let next: Tab | undefined;
    if (event.key === "Home") next = enabled[0];
    else if (event.key === "End") next = enabled.at(-1);
    else if (event.key === (vertical ? "ArrowDown" : "ArrowRight") ||
             event.key === (vertical ? "ArrowUp" : "ArrowLeft")) {
      const direction = event.key === (vertical ? "ArrowDown" : "ArrowRight") ? 1 : -1;
      for (let step = 1; step <= tabs.length; step++) {
        const candidate = tabs[(current + direction * step + tabs.length * step) % tabs.length];
        if (!candidate.button.disabled && candidate.button.isConnected) { next = candidate; break; }
      }
    }
    if (next) {
      event.preventDefault();
      focusedKey = next.key;
      render();
      next.button.focus({ preventScroll: true });
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void select(button.getAttribute("data-tab")!).catch(() => {});
    }
  }

  list.addEventListener("click", onClick, { signal: controller.signal });
  list.addEventListener("keydown", onKeydown, { signal: controller.signal });
  list.addEventListener("focusin", event => {
    const button = event.target;
    if (!(button instanceof HTMLButtonElement) || button.disabled) return;
    const key = button.getAttribute("data-tab") ?? "";
    if (tabByKey.get(key)?.button !== button) return;
    focusedKey = key;
    render();
  }, { signal: controller.signal });
  list.addEventListener("focusout", event => {
    if (event.relatedTarget instanceof Node && list.contains(event.relatedTarget)) return;
    focusedKey = selectedKey ?? options.initial;
    render();
  }, { signal: controller.signal });
  render();
  const ready = select(options.initial);
  void ready.catch(() => {});
  return {
    ready,
    selected: () => selectedKey,
    select,
    dispose() {
      if (disposal) return disposal;
      disposed = true;
      revision++;
      controller.abort();
      if (inFlight) void inFlight.dispose().catch(() => {});
      if (deactivating) void deactivating.dispose().catch(() => {});
      disposal = tail.then(async () => {
        let failure: unknown;
        for (const page of cache.values()) {
          try { await page.dispose(); } catch (cause) { failure ??= cause; }
        }
        cache.clear();
        selectedKey = null;
        stableKey = null;
        activeKey = null;
        for (const undo of restore.reverse()) undo();
        boundRoots.delete(root);
        if (failure !== undefined) throw failure;
      });
      return disposal;
    }
  };
}

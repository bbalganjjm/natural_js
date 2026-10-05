// SPDX-License-Identifier: Apache-2.0
import type { PageHandle } from "../page/index.js";

export type TabPage = Pick<PageHandle, "ready" | "activate" | "deactivate" | "dispose">;

export function tabAbort(): DOMException {
  return new DOMException("Tab operation aborted", "AbortError");
}

/** Shared page ownership for the two concrete tab binders; mountPage owns CVC. */
export function createTabPages(options: {
  create(key: string): TabPage;
  invalidPage(): Error;
  change(key: string | null, busy: boolean, focus: boolean): void;
  moveFocus(previous: string | null, next: string): void;
  error(show: boolean): void;
  recovered(failed: string, restored: string | null): void;
}) {
  const cache = new Map<string, TabPage>();
  const discarded = new WeakSet<TabPage>();
  const disposing = new WeakMap<TabPage, Promise<void>>();
  const pendingDisposals = new Set<Promise<void>>();
  const pendingByKey = new Map<string, Set<Promise<void>>>();
  let selected: string | null = null;
  let requested: string | null = null;
  let stable: string | null = null;
  let active: string | null = null;
  let inFlight: TabPage | null = null;
  let deactivating: TabPage | null = null;
  let disposed = false;
  let revision = 0;
  let tail = Promise.resolve();
  let disposal: Promise<void> | undefined;

  function change(key: string | null, busy: boolean, focus = false): void {
    selected = key;
    options.change(key, busy, focus);
  }
  function stale(expected: number): boolean { return disposed || expected !== revision; }
  function disposePage(page: TabPage): Promise<void> {
    const existing = disposing.get(page);
    if (existing) return existing;
    let result: Promise<void>;
    try { result = Promise.resolve(page.dispose()); } catch (cause) { result = Promise.reject(cause); }
    disposing.set(page, result);
    pendingDisposals.add(result);
    void result.then(() => { pendingDisposals.delete(result); }, () => { pendingDisposals.delete(result); });
    return result;
  }
  function evict(key: string, page: TabPage): Promise<void> {
    if (cache.get(key) === page) {
      cache.delete(key);
      if (active === key) active = null;
      if (stable === key) stable = null;
    }
    if (inFlight === page) inFlight = null;
    const result = disposePage(page);
    let pending = pendingByKey.get(key);
    if (!pending) { pending = new Set(); pendingByKey.set(key, pending); }
    pending.add(result);
    const settled = () => {
      pending!.delete(result);
      if (!pending!.size && pendingByKey.get(key) === pending) pendingByKey.delete(key);
    };
    void result.then(settled, settled);
    return result;
  }
  function forget(key: string): Promise<void> {
    const page = cache.get(key);
    if (page) discarded.add(page);
    if (page) void evict(key, page);
    const result = Promise.all([...(pendingByKey.get(key) ?? [])]).then(() => {});
    if (selected === key) change(null, false);
    return result;
  }
  function enqueue(action: () => Promise<void>): Promise<void> {
    const result = tail.then(action);
    tail = result.then(() => {}, () => {});
    return result;
  }
  async function transition(key: string, expected: number): Promise<void> {
    if (stale(expected)) throw tabAbort();
    const previous = stable;
    if (active === key && selected === key) return;
    if (active !== null && active !== key) {
      options.moveFocus(selected, key);
      const oldKey = active;
      const oldPage = cache.get(oldKey)!;
      deactivating = oldPage;
      try {
        await oldPage.deactivate();
      } catch (cause) {
        if (!discarded.has(oldPage)) {
          try { await evict(oldKey, oldPage); } catch { /* Preserve the lifecycle error. */ }
          if (stale(expected)) throw tabAbort();
          change(null, false);
          options.error(true);
          throw cause;
        }
      } finally {
        if (deactivating === oldPage) deactivating = null;
      }
      active = null;
    }
    if (stale(expected)) throw tabAbort();
    options.moveFocus(selected, key);
    change(key, true, true);
    options.error(false);
    let target = cache.get(key);
    try {
      if (target) {
        inFlight = target;
        await target.activate();
      } else {
        const candidate = options.create(key);
        target = candidate;
        if (!candidate || typeof candidate.activate !== "function" || typeof candidate.deactivate !== "function" ||
            typeof candidate.dispose !== "function" || typeof candidate.ready?.then !== "function") {
          throw options.invalidPage();
        }
        cache.set(key, target);
        inFlight = target;
        await target.ready;
      }
      if (stale(expected)) throw tabAbort();
      inFlight = null;
      active = key;
      stable = key;
      change(key, false);
    } catch (cause) {
      if (target && typeof target.dispose === "function") {
        try { await evict(key, target); } catch { /* Preserve the failed page's error. */ }
      }
      if (stale(expected)) throw tabAbort();
      const previousPage = previous === null || previous === key ? undefined : cache.get(previous);
      if (previousPage) {
        const restoreKey = previous!;
        change(restoreKey, true, true);
        inFlight = previousPage;
        try {
          await previousPage.activate();
          if (stale(expected)) throw tabAbort();
          active = restoreKey;
          stable = restoreKey;
        } catch {
          try { await evict(restoreKey, previousPage); } catch { /* Preserve the failed target's error. */ }
          if (stale(expected)) throw tabAbort();
          stable = null;
          change(null, false);
        } finally {
          if (inFlight === previousPage) inFlight = null;
        }
      } else {
        stable = null;
        change(null, false);
      }
      requested = stable;
      change(selected, false);
      options.error(true);
      options.recovered(key, stable);
      throw cause;
    }
  }

  return {
    selected: () => selected,
    requested: () => requested,
    select(key: string): Promise<void> {
      if (disposed) return Promise.reject(tabAbort());
      const expected = ++revision;
      requested = key;
      if (inFlight) void disposePage(inFlight);
      return enqueue(() => transition(key, expected));
    },
    remove(key: string): Promise<void> {
      if (disposed) return Promise.reject(tabAbort());
      if (requested === key) { revision++; requested = null; }
      return forget(key);
    },
    reload(key: string): Promise<void> {
      if (disposed) return Promise.reject(tabAbort());
      const expected = ++revision;
      requested = key;
      if (inFlight) void disposePage(inFlight);
      const removed = forget(key);
      return enqueue(async () => {
        await removed;
        if (stale(expected)) throw tabAbort();
        await transition(key, expected);
      });
    },
    dispose(): Promise<void> {
      if (disposal) return disposal;
      disposed = true;
      revision++;
      requested = null;
      if (inFlight) void disposePage(inFlight);
      if (deactivating) void disposePage(deactivating);
      disposal = tail.then(async () => {
        let failed = false;
        let failure: unknown;
        for (const page of cache.values()) {
          try { await disposePage(page); } catch (cause) {
            if (!failed) { failed = true; failure = cause; }
          }
        }
        // Also wait for close/reload removals that no longer belong to the cache.
        for (const pending of pendingDisposals) {
          try { await pending; } catch (cause) {
            if (!failed) { failed = true; failure = cause; }
          }
        }
        cache.clear();
        selected = stable = active = null;
        if (failed) throw failure;
      });
      return disposal;
    }
  };
}

export function panelHasFocusTarget(panel: HTMLElement): boolean {
  return [...panel.querySelectorAll<HTMLElement>(
    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex], [contenteditable]:not([contenteditable="false"])'
  )].some(element => element.tabIndex >= 0 && !element.closest("[hidden]") && !element.closest("[inert]"));
}

export function nextTab<T extends { button: HTMLButtonElement }>(
  tabs: readonly T[], current: HTMLButtonElement, key: string, vertical: boolean
): T | undefined {
  const enabled = tabs.filter(tab => !tab.button.disabled && tab.button.isConnected);
  if (key === "Home") return enabled[0];
  if (key === "End") return enabled.at(-1);
  const forward = vertical ? "ArrowDown" : "ArrowRight";
  const backward = vertical ? "ArrowUp" : "ArrowLeft";
  if (key !== forward && key !== backward) return undefined;
  const index = enabled.findIndex(tab => tab.button === current);
  if (index < 0 || !enabled.length) return undefined;
  return enabled[(index + (key === forward ? 1 : -1) + enabled.length) % enabled.length];
}

// SPDX-License-Identifier: Apache-2.0
import { createRows } from "@bbalganjjm/natural_js/data";
import type { Rows } from "@bbalganjjm/natural_js/data";
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageContext, PageHandle } from "@bbalganjjm/natural_js/page";
import { bindGrid } from "@bbalganjjm/natural_js/ui";
import type { GridBindResult, GridHandle } from "@bbalganjjm/natural_js/ui";

type Item = { name: string; profile: { team: string }; note: string;
  assignment: { shifts: { meta: { label: string }; code: number }[]; chosen: number } };
export interface ProgressiveScreen {
  readonly root: HTMLElement;
  readonly table: HTMLTableElement;
  readonly rows: Rows<Item>;
  readonly grid: GridHandle<Item>;
  readonly original: string;
  readonly completions: readonly GridBindResult[];
  readonly resources: { active: number; released: number; clicks: number };
  readonly pending: boolean;
  readonly paused: boolean;
  readonly aborted: boolean;
}
export const screens = new Map<string, ProgressiveScreen>();
export const pages = new Map<string, PageHandle>();

function find<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error("Progressive HTML needs " + selector);
  return element;
}

function controller({ root, input, signal, own }: PageContext<{ slot: string }>) {
  const rows = createRows<Item>(Array.from({ length: 40 }, (_, index) => ({
    name: (input.slot === "a" ? "Ledger " : "Notebook ") + String(index + 1).padStart(2, "0"),
    profile: { team: index % 2 ? "Support" : "Platform" }, note: "Loaded record " + (index + 1),
    assignment: { shifts: [{ meta: { label: "Morning" }, code: 1 }, { meta: { label: "Evening" }, code: 2 }], chosen: index % 2 + 1 }
  })));
  own(() => rows.dispose());
  const table = find<HTMLTableElement>(root, "[data-progress-grid]");
  const scroll = find<HTMLElement>(root, "[data-progress-scroll]");
  const notice = find<HTMLOutputElement>(root, "[data-progress-notice]");
  const output = find<HTMLElement>(root, "[data-progress-state]");
  const ping = find<HTMLOutputElement>(root, "[data-progress-ping]");
  const clicks = find<HTMLOutputElement>(root, "[data-progress-clicks]");
  const original = table.outerHTML;
  const completions: GridBindResult[] = [];
  const resources = { active: 0, released: 0, clicks: 0 };
  let active = false, pending = false, paused = false, automatic = false, operation = 0, pingCount = 0;
  let latest: GridBindResult | null = null;

  function buttons(): void {
    for (const button of root.querySelectorAll<HTMLButtonElement>("button[data-progress-action]")) {
      const action = button.dataset.progressAction;
      const continuation = action !== "ping" && action !== "cancel";
      button.disabled = action === "ping" ? !active : action === "cancel" ? !active || !pending
        : !active || !pending && (latest?.last !== false || (action === "resume" ? !paused : paused));
      button.setAttribute("aria-disabled", String(button.disabled || continuation && pending));
    }
  }
  function show(result: GridBindResult): void {
    if (signal.aborted) return;
    latest = result;
    output.textContent = JSON.stringify({ total: result.total, filtered: result.filtered, visible: result.visible,
      available: result.available, mounted: result.mounted, first: result.first, last: result.last,
      event: result.event?.type ?? null }, null, 2);
    root.dataset.available = String(result.available);
    root.dataset.mounted = String(result.mounted);
    buttons();
  }
  const grid = bindGrid(table, {
    rows, progressive: { size: 5, delay: 20 },
    onBind(result) { if (!signal.aborted) { completions.push(result); show(result); } },
    onRowBind(context) {
      resources.active++;
      const click = () => { if (!signal.aborted) clicks.value = String(++resources.clicks); };
      for (const element of context.elements) element.addEventListener("click", click);
      context.own(() => {
        for (const element of context.elements) element.removeEventListener("click", click);
        resources.active--; resources.released++;
      });
    }
  });
  signal.addEventListener("abort", () => { operation++; pending = false; grid.dispose(); }, { once: true });
  own(() => { operation++; grid.dispose(); screens.delete(input.slot); });

  async function watch(more: boolean, all: boolean): Promise<void> {
    if (!active || signal.aborted || pending) return;
    const expected = ++operation;
    const live = () => active && !signal.aborted && operation === expected;
    pending = true; paused = false; automatic = all;
    notice.value = "Binding loaded records; Ping and Cancel remain available.";
    buttons();
    let task: Promise<GridBindResult> | undefined;
    try {
      task = more ? grid.renderMore() : grid.whenBound();
      let result = await task;
      while (live()) {
        show(result);
        if (!all || result.last) break;
        task = grid.renderMore();
        result = await task;
      }
      if (!live()) return;
      notice.value = result.last ? "Full logical page available." : "Chunk ready; Next continues the loaded prefix.";
    } catch (cause) {
      if (!live()) return;
      if (cause instanceof Error && cause.name === "AbortError" && grid.whenBound() !== task) {
        pending = false;
        void watch(false, all);
        return;
      }
      show(grid.cancelBinding()); paused = latest?.last === false;
      notice.value = cause instanceof Error && cause.name === "AbortError" ? "Binding canceled; prefix retained."
        : "Binding failed: " + (cause instanceof Error ? cause.message : String(cause));
    } finally { if (live()) { pending = false; buttons(); } }
  }

  root.addEventListener("click", event => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button[data-progress-action]") : null;
    if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;
    const action = button.dataset.progressAction;
    if (action === "ping") { ping.value = String(++pingCount); return; }
    if (action === "cancel") {
      operation++; pending = false; automatic = false;
      show(grid.cancelBinding()); paused = latest?.last === false;
      notice.value = "Binding canceled; admitted prefix and Rows retained."; buttons(); return;
    }
    void watch(true, action === "all" || action === "resume" && automatic);
  }, { signal });
  scroll.addEventListener("scroll", () => {
    if (!active || pending || paused || latest?.last !== false || scroll.clientHeight <= 0 || scroll.scrollHeight <= scroll.clientHeight) return;
    if (scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 2) void watch(true, false);
  }, { signal, passive: true });
  screens.set(input.slot, { root, table, rows, grid, original, completions, resources,
    get pending() { return pending; }, get paused() { return paused; }, get aborted() { return signal.aborted; } });
  buttons();
  return {
    activate() { active = true; void watch(paused, automatic); buttons(); },
    async deactivate() {
      active = false; operation++; pending = false;
      if (!signal.aborted) {
        show(grid.cancelBinding()); paused = latest?.last === false;
        notice.value = "Retained inactive page; activate resumes its unfinished prefix."; buttons();
      }
      await new Promise<void>(resolve => root.ownerDocument.defaultView!.setTimeout(resolve, 60));
      if (!signal.aborted) notice.value = "Inactive cleanup finished; loaded Rows remain owned by this page.";
    },
    dispose() { active = false; operation++; }
  };
}

function open(slot: string): PageHandle {
  const host = find<HTMLElement>(document, '[data-progressive-host="' + slot + '"]');
  const template = find<HTMLTemplateElement>(document, 'template[data-progressive-template="' + slot + '"]');
  return mountPage(host, { view: () => template.content.firstElementChild!.cloneNode(true) as HTMLElement, controller }, { slot });
}
for (const slot of ["a", "b"]) pages.set(slot, open(slot));
export const ready = Promise.all([...pages.values()].map(page => page.ready));
void ready.catch(cause => { for (const slot of ["a", "b"]) find<HTMLOutputElement>(document, '[data-page-state="' + slot + '"]').value = String(cause); });

document.addEventListener("click", event => {
  const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button[data-page-action]") : null;
  if (!button) return;
  const slot = button.dataset.page!, action = button.dataset.pageAction!;
  const page = pages.get(slot)!;
  const status = find<HTMLOutputElement>(document, '[data-page-state="' + slot + '"]');
  void (async () => {
    try {
      if (action === "restart") {
        await page.dispose();
        if (pages.get(slot) !== page) return;
        const next = open(slot); pages.set(slot, next); await next.ready;
        if (pages.get(slot) === next) status.value = "Fresh page instance ready.";
        return;
      }
      if (action === "deactivate") await page.deactivate();
      else if (action === "activate") await page.activate();
      else if (action === "reload") await page.reload();
      else if (action === "dispose") await page.dispose();
      if (pages.get(slot) === page) status.value = action + " completed.";
    } catch (cause) {
      if (pages.get(slot) === page) status.value = cause instanceof Error ? cause.message : String(cause);
    }
  })();
});
window.addEventListener("pagehide", () => { for (const page of pages.values()) void page.dispose(); }, { once: true });

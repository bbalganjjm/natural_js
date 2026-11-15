// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";

const modules = Object.fromEntries(["ui", "data", "page", "comm"].map(name =>
  [name, "/@fs/" + fileURLToPath(new URL("../../src/" + name + "/index.ts", import.meta.url)).replaceAll("\\", "/")]));

for (const layout of ["side", "stack"] as const) {
  test(layout + " opts into current first-row selection without clearing an existing view filter", async ({ page }) => {
    const errors: Error[] = []; page.on("pageerror", cause => errors.push(cause));
    await page.goto("/m4/" + layout + ".html?selection=first");
    const screen = page.locator('[data-page="employees"]'), detail = screen.locator('[data-role="detail"]');
    await expect(screen.locator('[data-role="selected"]')).toHaveText("Selected: Ada");
    await expect(detail.locator('[data-field="name"]')).toHaveValue("Ada");
    const filter = screen.locator('[data-role="filter"]');
    await filter.fill("Grace");
    await expect(screen.locator("tbody tr")).toHaveCount(1);
    await screen.locator('[data-role="search"]').getByRole("button", { name: "Search", exact: true }).click();
    await expect(screen.locator('[data-role="selected"]')).toHaveText("Selected: Grace");
    await expect(filter).toHaveValue("Grace");
    await expect(screen.locator("tbody tr")).toHaveCount(1);
    await expect(detail.locator('[data-field="name"]')).toHaveValue("Grace");
    await expect(screen.locator('tbody [data-select-row][aria-pressed="true"]')).toHaveCount(1);
    await filter.fill("");
    const search = screen.locator('[data-role="search"]');
    await search.locator('[data-field="query"]').fill("empty");
    await search.getByRole("button", { name: "Search", exact: true }).click();
    await expect(screen.locator("tbody tr")).toHaveCount(0);
    await expect(screen.locator('[data-role="selected"]')).toHaveText("No employee selected");
    await expect(detail.locator('[data-field="name"]')).toHaveValue("");
    expect(errors).toEqual([]);
  });

  for (const initial of [null, "E-102"] as const) {
    test(layout + " keeps explicit declaration selection " + initial + " before later opted searches", async ({ page }) => {
      await page.route("**/m4/employee-start.json", async route => {
        const response = await route.fetch(), value = await response.json();
        await route.fulfill({ response, json: { ...value, query: "", selectedEmployee: initial } });
      });
      await page.goto("/m4/" + layout + ".html?selection=first&declarations=async");
      const screen = page.locator('[data-page="employees"]'), detail = screen.locator('[data-role="detail"]');
      await expect(screen.locator('[data-role="status"]')).toHaveText("Employee declarations ready");
      await expect(screen.locator('[data-role="selected"]')).toHaveText(initial === null ? "No employee selected" : "Selected: Grace");
      await expect(detail.locator('[data-field="name"]')).toHaveValue(initial === null ? "" : "Grace");
      const search = screen.locator('[data-role="search"]');
      await search.locator('[data-field="query"]').fill("Ada");
      await search.getByRole("button", { name: "Search", exact: true }).click();
      await expect(screen.locator('[data-role="selected"]')).toHaveText("Selected: Ada");
      await expect(detail.locator('[data-field="name"]')).toHaveValue("Ada");
    });
  }

  test(layout + " rejects an older opted selection when a current DOM update starts a newer request", async ({ page }) => {
    const errors: Error[] = []; page.on("pageerror", cause => errors.push(cause));
    await page.goto("/m4/" + layout + ".html?selection=first");
    const screen = page.locator('[data-page="employees"]');
    await expect(screen.locator('[data-role="selected"]')).toHaveText("Selected: Ada");
    await screen.evaluate(root => {
      const selected = root.querySelector<HTMLOutputElement>('[data-role="selected"]')!;
      selected.setAttribute("data-selections", "[]");
      new MutationObserver(records => {
        const values = JSON.parse(selected.getAttribute("data-selections")!) as string[];
        for (const record of records) for (const node of record.addedNodes) {
          if (node.textContent?.startsWith("Selected: ")) values.push(node.textContent);
        }
        selected.setAttribute("data-selections", JSON.stringify(values));
      }).observe(selected, { childList: true });
      const next = new MutationObserver(() => {
        next.disconnect();
        const form = root.querySelector<HTMLFormElement>('[data-role="search"]')!;
        const input = form.querySelector<HTMLInputElement>('[data-field="query"]')!;
        input.value = "Ada"; input.dispatchEvent(new Event("input", { bubbles: true })); form.requestSubmit();
      });
      next.observe(root.querySelector("tbody")!, { childList: true });
    });
    const search = screen.locator('[data-role="search"]');
    await search.locator('[data-field="query"]').fill("Grace");
    await search.getByRole("button", { name: "Search", exact: true }).click();
    await expect(screen.locator('[data-role="status"]')).toHaveText("1 employees");
    await expect(screen.locator("tbody tr")).toHaveCount(1);
    await expect(screen.locator('tbody [data-field="name"]')).toHaveText("Ada");
    await expect(screen.locator('[data-role="selected"]')).toHaveAttribute("data-selections", '["Selected: Ada"]');
    expect(errors).toEqual([]);
  });

  test(layout + " drops an opted selection when page cleanup runs before the binding continuation", async ({ page }) => {
    const errors: Error[] = []; page.on("pageerror", cause => errors.push(cause));
    await page.goto("/m4/" + layout + ".html?selection=first");
    const screen = page.locator('[data-page="employees"]');
    await expect(screen.locator('[data-role="selected"]')).toHaveText("Selected: Ada");
    await screen.evaluate(root => {
      const output = document.createElement("output"); output.setAttribute("data-after-close", ""); document.body.append(output);
      const selected = root.querySelector('[data-role="selected"]')!, selections: string[] = [];
      new MutationObserver(records => {
        for (const record of records) for (const node of record.addedNodes) {
          if (node.textContent?.startsWith("Selected: ")) selections.push(node.textContent);
        }
        output.textContent = JSON.stringify(selections);
      }).observe(selected, { childList: true });
      const close = new MutationObserver(() => {
        close.disconnect();
        (root.querySelector('[data-action="close"]') as HTMLButtonElement).click();
      });
      close.observe(root.querySelector("tbody")!, { childList: true });
    });
    const search = screen.locator('[data-role="search"]');
    await search.locator('[data-field="query"]').fill("Grace");
    await search.getByRole("button", { name: "Search", exact: true }).click();
    await expect(screen).toHaveCount(0);
    await expect(page.locator("[data-after-close]")).toHaveText("[]");
    await page.locator('[data-action="open"]').click();
    await expect(page.locator('[data-page="employees"] [data-role="selected"]')).toHaveText("Selected: Ada");
    expect(errors).toEqual([]);
  });
}

test("preloaded CVC selection waits for constructed handles and retains a captured veto with complete cleanup", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async modules => {
    const { createRows } = await import(modules.data) as typeof import("../../src/data/index.js");
    const { bindGrid } = await import(modules.ui) as typeof import("../../src/ui/index.js");
    const { mountPage } = await import(modules.page) as typeof import("../../src/page/index.js");
    const results: unknown[] = [];
    for (const veto of [false, true]) {
      const host = document.createElement("div"); document.body.append(host);
      const rows = createRows([{ name: "First" }, { name: "Second" }]);
      let notifications = 0, source = 0, grid: import("../../src/ui/index.js").GridHandle<{ name: string }> | undefined, table: HTMLTableElement | undefined;
      const owner = mountPage(host, {
        view() {
          const root = document.createElement("section");
          root.innerHTML = '<table aria-label="Preloaded"><thead><tr><th scope="col">Name</th></tr></thead><tbody><tr data-row-template><td data-field="name">Authored</td></tr></tbody></table>';
          return root;
        },
        controller(context) {
          table = context.root.querySelector("table")!;
          const bound = bindGrid(table, { rows,
            beforeSourceBind() { source++; },
            onSourceBind() { source++; },
            beforeSelect: () => !veto, onSelect() { notifications++; } });
          grid = bound; context.own(() => bound.dispose());
          return { async init() {
            await bound.whenBound(); context.signal.throwIfAborted();
            const first = bound.rowIds("visible")[0]; if (first !== undefined) bound.select(first);
          } };
        }
      }, {});
      await owner.ready;
      const selected = grid!.selected(), count = notifications, sourceCount = source;
      await owner.dispose(); rows.set(rows.entries()[0].id, "name", "Late");
      results.push({ veto, selected, notifications, count, source, sourceCount,
        restored: table!.querySelector('[data-field="name"]')!.textContent });
      rows.dispose(); host.remove();
    }
    return results;
  }, modules);
  expect(result).toEqual([
    { veto: false, selected: 1, notifications: 1, count: 1, source: 4, sourceCount: 4, restored: "Authored" },
    { veto: true, selected: null, notifications: 0, count: 0, source: 4, sourceCount: 4, restored: "Authored" }
  ]);
});

test("application precommit writes observe equal requests and preserve raw peer and wire values across failures", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async modules => {
    const { createRows } = await import(modules.data) as typeof import("../../src/data/index.js");
    const { bindForm, bindGrid } = await import(modules.ui) as typeof import("../../src/ui/index.js");
    const { createCommunicator } = await import(modules.comm) as typeof import("../../src/comm/index.js");
    const root = document.createElement("section");
    root.innerHTML = '<form><label>Amount <input data-field="amount"></label></form><table aria-label="Peer"><thead><tr><th scope="col">Amount</th></tr></thead><tbody><tr data-row-template><td data-field="amount"></td></tr></tbody></table>';
    document.body.append(root);
    const rows = createRows([{ amount: 10, note: "original" }]), id = rows.entries()[0].id;
    const form = bindForm(root.querySelector("form")!, { rows }), grid = bindGrid(root.querySelector("table")!, { rows });
    form.bind(id);
    let events = 0; rows.subscribe(() => events++);
    const trace: unknown[] = [];
    function write(requested: string | number, before?: () => void) {
      const previous = rows.get(id)!;
      trace.push(["before", previous.value.amount, requested]);
      before?.();
      const value = Math.round(Number(requested));
      if (rows.get(id) !== previous) throw new Error("stale");
      rows.set(id, "amount", value);
      trace.push(["after", previous.value.amount, requested, rows.get(id)!.value.amount]);
    }
    function failure(run: () => void) { try { run(); return null; } catch (cause) { return (cause as Error).message; } }
    write(10); const equal = { events, trace: trace.splice(0) };
    write("13.6");
    const normalized = { value: rows.get(id)!.value.amount, original: rows.original(id)!.amount,
      form: form.read().amount, peer: root.querySelector("td")!.textContent, trace: trace.splice(0) };
    const blocked = failure(() => write(20, () => { throw new Error("blocked"); }));
    const blockedValue = rows.get(id)!.value.amount;
    const stale = failure(() => write(30, () => rows.set(id, "note", "inner")));
    const staleValue = rows.get(id)!.value;
    trace.length = 0;
    const stop = rows.subscribe(() => { throw new Error("postcommit"); }); let later = 0; rows.subscribe(() => later++);
    const post = failure(() => write(17)), postTrace = trace.splice(0); stop();
    let wire: unknown;
    const comm = createCommunicator({ send: async request => {
      wire = await request.json(); return new Response(null, { status: 204 });
    } });
    await comm.request({ url: new URL("/recipe-save", document.baseURI), method: "POST",
      json: rows.changes().map(({ status, value }) => ({ status, value })), decode: () => undefined });
    const after = { value: rows.get(id)!.value.amount, form: form.read().amount, peer: root.querySelector("td")!.textContent, later };
    form.dispose(); grid.dispose(); rows.dispose(); root.remove();
    return { equal, normalized, blocked, blockedValue, stale, staleValue, post, postTrace, after, wire };
  }, modules);
  expect(result).toEqual({
    equal: { events: 0, trace: [["before", 10, 10], ["after", 10, 10, 10]] },
    normalized: { value: 14, original: 10, form: 14, peer: "14", trace: [["before", 10, "13.6"], ["after", 10, "13.6", 14]] },
    blocked: "blocked", blockedValue: 14, stale: "stale", staleValue: { amount: 14, note: "inner" },
    post: "postcommit", postTrace: [["before", 14, 17]], after: { value: 17, form: 17, peer: "17", later: 1 },
    wire: [{ status: "update", value: { amount: 17, note: "inner" } }]
  });
});

test("application callback composition retains undefined false original arguments and explicit live forwarding", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async modules => {
    const { createRows } = await import(modules.data) as typeof import("../../src/data/index.js");
    const { bindForm } = await import(modules.ui) as typeof import("../../src/ui/index.js");
    const cases: unknown[] = [];
    for (const beforeValue of [undefined, false]) for (const afterValue of [undefined, false]) {
      const root = document.createElement("form"); root.innerHTML = '<label>Name <input data-field="name"></label>'; document.body.append(root);
      const rows = createRows([{ name: "raw" }]), id = rows.entries()[0].id, trace: unknown[] = [];
      const localBefore = (raw: unknown) => { trace.push(["local-before", raw]); return beforeValue; };
      let shared = (raw: unknown) => { trace.push(["shared-A", raw === undefined ? "undefined" : raw]); return undefined; };
      const localAfter = (raw: unknown) => { trace.push(["local-after", raw]); return afterValue; };
      const sharedAfter = (raw: unknown) => { trace.push(["shared-after", raw]); };
      const form = bindForm(root, { rows,
        beforeBindValue(raw) { const local = localBefore(raw), current = shared; return current(local); },
        onBindValue(raw) { if (localAfter(raw) !== false) sharedAfter(raw); } });
      form.bind(id); const first = { shown: root.querySelector("input")!.value, raw: rows.get(id)!.value.name, trace: trace.splice(0) };
      shared = raw => { trace.push(["shared-B", raw === undefined ? "undefined" : raw]); return undefined; };
      form.bind(id); const second = { shown: root.querySelector("input")!.value, raw: rows.get(id)!.value.name, trace: trace.splice(0) };
      cases.push({ before: beforeValue === undefined ? "undefined" : beforeValue, after: afterValue === undefined ? "undefined" : afterValue, first, second });
      form.dispose(); rows.dispose(); root.remove();
    }
    return cases;
  }, modules);
  const expected: unknown[] = [];
  for (const before of ["undefined", false]) for (const after of ["undefined", false]) {
    const trace = (policy: string) => [["local-before", "raw"], [policy, before], ["local-after", "raw"],
      ...(after === false ? [] : [["shared-after", "raw"]])];
    expected.push({ before, after, first: { shown: "raw", raw: "raw", trace: trace("shared-A") },
      second: { shown: "raw", raw: "raw", trace: trace("shared-B") } });
  }
  expect(result).toEqual(expected);
});

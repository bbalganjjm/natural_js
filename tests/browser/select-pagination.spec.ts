import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const source = (path: string) =>
  `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;

const modules = {
  select: source("../../src/ui/select.ts"),
  owner: source("../../src/ui/select-owner.ts"),
  pagination: source("../../src/ui/pagination.ts")
};

test("Select preserves authored raw strings and generated typed choices", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ select }) => {
    const { bindSelect } = await import(select);
    const root = document.createElement("select");
    root.innerHTML = '<option value="">Choose</option><option value="1">Authored one</option>';
    document.body.append(root);
    const events: unknown[] = [];
    const handle = bindSelect(root, { choices: [
      { label: "Numeric one", value: 1 },
      { label: "Duplicate one", value: 1 },
      { label: "True", value: true }
    ], value: 1, onChange: (value: unknown) => events.push(value) });
    const numeric = { value: handle.value(), index: root.selectedIndex, dom: root.value };
    handle.setValue("1");
    const authored = { value: handle.value(), index: root.selectedIndex };
    handle.setValue(null);
    const empty = { value: handle.value(), index: root.selectedIndex };
    root.selectedIndex = 4;
    root.dispatchEvent(new Event("change", { bubbles: true }));
    handle.setChoices([{ label: "Still true", value: true }]);
    const replaced = { value: handle.value(), index: root.selectedIndex, count: root.options.length };
    const sameNodes = [root.options[0], root.options[1]];
    handle.dispose();
    const restored = {
      count: root.options.length, sameNodes: root.options[0] === sameNodes[0] && root.options[1] === sameNodes[1],
      selected: root.selectedIndex
    };
    root.remove();
    return { numeric, authored, empty, events, replaced, restored };
  }, modules);
  expect(result).toEqual({
    numeric: { value: 1, index: 2, dom: "1" },
    authored: { value: "1", index: 1 }, empty: { value: null, index: 0 },
    events: [true], replaced: { value: true, index: 2, count: 3 },
    restored: { count: 2, sameNodes: true, selected: 0 }
  });
});

test("multiple Select keeps scalar identity, order, ownership, and disposal", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ select, owner }) => {
    const { bindSelect } = await import(select);
    const { claimSelect } = await import(owner);
    const root = document.createElement("select");
    root.multiple = true;
    root.innerHTML = '<option value="1" selected>Authored string</option>';
    document.body.append(root);
    const external = claimSelect(root, "bindForm");
    let owned = "";
    try { bindSelect(root, { choices: [] }); } catch (cause) { owned = (cause as { code: string }).code; }
    external();
    const handle = bindSelect(root, { choices: [
      { label: "First number", value: 1 }, { label: "Second number", value: 1 },
      { label: "Boolean", value: true, disabled: true }
    ] });
    const initial = handle.value();
    handle.setValue([1, "1", 1]);
    const selected = { values: handle.value(), indexes: [...root.options].flatMap((option, index) => option.selected ? [index] : []) };
    let wrongShape = "";
    try { handle.setValue(1); } catch (cause) { wrongShape = (cause as { code: string }).code; }
    let duplicate = "";
    try { bindSelect(root, { choices: [] }); } catch (cause) { duplicate = (cause as { code: string }).code; }
    handle.dispose();
    handle.dispose();
    let afterDispose = "";
    try { handle.value(); } catch (cause) { afterDispose = (cause as { code: string }).code; }
    const rebind = bindSelect(root, { choices: [{ label: "One", value: 1 }] });
    rebind.dispose();
    const restored = { count: root.options.length, selected: root.options[0].selected };
    root.remove();
    return { owned, initial, selected, wrongShape, duplicate, afterDispose, restored };
  }, modules);
  expect(result).toEqual({
    owned: "SELECT_OWNED", initial: ["1"],
    selected: { values: ["1", 1, 1], indexes: [0, 1, 2] },
    wrongShape: "SELECT_VALUE", duplicate: "SELECT_OWNED", afterDispose: "SELECT_DISPOSED",
    restored: { count: 1, selected: true }
  });
});

test("Pagination is controlled, bounded, accessible, focus-safe, and reversible", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pagination }) => {
    const { bindPagination } = await import(pagination);
    const root = document.createElement("nav");
    root.setAttribute("aria-label", "Pages");
    root.innerHTML = `<button type="button" data-page-first>First</button>
      <button type="button" data-page-prev>Previous</button>
      <button type="button" data-page-template class="author-page"><span data-page-number></span></button>
      <button type="button" data-page-next>Next</button>
      <button type="button" data-page-last>Last</button>
      <output data-page-status>Original</output>`;
    document.body.append(root);
    const originalTemplate = root.querySelector("[data-page-template]");
    const requests: unknown[] = [];
    const handle = bindPagination(root, { state: { page: 1, size: 10, total: 52 },
      onPage: (request: unknown) => requests.push(request) });
    const buttons = () => [...root.querySelectorAll<HTMLButtonElement>("button[aria-label^='Page ']")];
    const first = {
      state: handle.state(), pages: buttons().map(button => button.textContent),
      prevDisabled: root.querySelector<HTMLButtonElement>("[data-page-prev]")!.disabled,
      status: root.querySelector("[data-page-status]")!.textContent,
      live: root.querySelector("[data-page-status]")!.getAttribute("aria-live")
    };
    buttons()[2].focus();
    buttons()[2].click();
    const controlled = { state: handle.state(), requests };
    handle.set({ page: 3, size: 10, total: 52 });
    const focused = document.activeElement?.getAttribute("aria-label");
    const current = root.querySelector("[aria-current=page]")?.textContent;
    handle.set({ page: 9, size: 10, total: 21 });
    const shortened = { state: handle.state(), pages: buttons().map(button => button.textContent) };
    handle.set({ page: 1, size: 10, total: 0 });
    const empty = { state: handle.state(), pages: buttons().length,
      nextDisabled: root.querySelector<HTMLButtonElement>("[data-page-next]")!.disabled,
      status: root.querySelector("[data-page-status]")!.textContent };
    handle.dispose();
    handle.dispose();
    const restored = { sameTemplate: root.querySelector("[data-page-template]") === originalTemplate,
      status: root.querySelector("[data-page-status]")!.textContent,
      live: root.querySelector("[data-page-status]")!.getAttribute("aria-live"),
      prevDisabled: root.querySelector<HTMLButtonElement>("[data-page-prev]")!.disabled,
      pageButtons: buttons().length };
    const duplicateIds = [...root.querySelectorAll("[id]")].length;
    root.remove();
    return { first, controlled, focused, current, shortened, empty, restored, duplicateIds };
  }, modules);
  expect(result).toEqual({
    first: { state: { page: 1, size: 10, total: 52, pages: 6 }, pages: ["1", "2", "3", "4", "5"],
      prevDisabled: true, status: "Page 1 of 6", live: "polite" },
    controlled: { state: { page: 1, size: 10, total: 52, pages: 6 }, requests: [{ page: 3, size: 10 }] },
    focused: "Page 3", current: "3",
    shortened: { state: { page: 3, size: 10, total: 21, pages: 3 }, pages: ["1", "2", "3"] },
    empty: { state: { page: 1, size: 10, total: 0, pages: 0 }, pages: 0,
      nextDisabled: true, status: "No pages" },
    restored: { sameTemplate: true, status: "Original", live: null, prevDisabled: false, pageButtons: 0 },
    duplicateIds: 0
  });
});

test("Pagination rejects invalid state and repeated IDs before changing the HTML", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pagination }) => {
    const { bindPagination } = await import(pagination);
    const root = document.createElement("nav");
    root.innerHTML = '<button data-page-prev>Back</button><button data-page-template id="repeated">1</button>';
    document.body.append(root);
    const onPage = () => {};
    const fail = (state: { page: number; size: number; total: number }) => {
      try { bindPagination(root, { state, onPage }); return "ok"; }
      catch (cause) { return (cause as { code: string }).code; }
    };
    const badSize = fail({ page: 1, size: 0, total: 10 });
    const repeatedId = fail({ page: 1, size: 10, total: 10 });
    root.querySelector("[data-page-template]")?.removeAttribute("id");
    const handle = bindPagination(root, { state: { page: 1, size: 10, total: 10 }, onPage });
    const duplicate = fail({ page: 1, size: 10, total: 10 });
    let disposed = "";
    handle.dispose();
    try { handle.state(); } catch (cause) { disposed = (cause as { code: string }).code; }
    const untouched = root.querySelector("[data-page-template]") !== null;
    root.remove();
    return { badSize, repeatedId, duplicate, disposed, untouched };
  }, modules);
  expect(result).toEqual({
    badSize: "PAGINATION_STATE", repeatedId: "DUPLICATE_ID", duplicate: "PAGINATION_OWNED",
    disposed: "PAGINATION_DISPOSED", untouched: true
  });
});


test("Pagination state snapshot cannot change its internal page", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ pagination }) => {
    const { bindPagination } = await import(pagination);
    const root = document.createElement("nav");
    root.innerHTML = '<button type="button" data-page-next>Next</button><output data-page-status></output>';
    document.body.append(root);
    const requests: number[] = [];
    const handle = bindPagination(root, { state: { page: 1, size: 5, total: 20 },
      onPage: ({ page }: { page: number }) => requests.push(page) });
    try { (handle.state() as { page: number }).page = 99; } catch { /* frozen snapshot */ }
    root.querySelector<HTMLButtonElement>("button")!.click();
    const state = handle.state();
    handle.dispose(); root.remove();
    return { requests, state };
  }, modules);
  expect(result).toEqual({ requests: [2], state: { page: 1, size: 5, total: 20, pages: 4 } });
});

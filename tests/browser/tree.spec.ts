// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const source = (path: string) =>
  `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { tree: source("../../src/ui/tree.ts"), data: source("../../src/data/index.ts") };

test("Tree resolves unordered parents, binds nested text, and reuses nodes on updates", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ tree, data }) => {
    const { bindTree } = await import(tree);
    const { createRows } = await import(data);
    const root = document.createElement("ul");
    root.setAttribute("aria-label", "Departments");
    root.innerHTML = `<li data-row-template class="authored-node">
      <button type="button" data-tree-toggle aria-label="Toggle department">+</button>
      <span data-tree-label data-field="profile.name" data-format='[["upper"]]'></span>
      <ul data-tree-children></ul></li><li data-empty hidden>No departments</li>`;
    const original = root.outerHTML;
    document.body.append(root);
    const rows = createRows([
      { key: "child", parent: "root", profile: { name: "<i>Child</i>" } },
      { key: "root", parent: null, profile: { name: "Root" } },
      { key: 1, parent: null, profile: { name: "Another" } }
    ]);
    const [child, parent, other] = rows.entries().map((row: { id: number }) => row.id);
    const formatted: number[] = [];
    const events: { id: number | null; raw: string | null; event: boolean }[] = [];
    const handle = bindTree(root, {
      rows, key: (row: { key: string | number }) => row.key,
      parent: (row: { parent: string | null }) => row.parent,
      rules: { format: { upper: (value: string, _args: unknown[], context: { rowId: number }) => {
        formatted.push(context.rowId);
        return value.toUpperCase();
      } } },
      onSelect: ({ id, row, event }: { id: number | null; row: { value: { profile: { name: string } } } | null; event: Event | null }) =>
        events.push({ id, raw: row?.value.profile.name ?? null, event: event !== null })
    });
    const labels = [...root.querySelectorAll<HTMLElement>("[data-tree-label]")];
    const childElement = labels.find(label => label.textContent === "<I>CHILD</I>")!.closest("li")!;
    const parentElement = labels.find(label => label.textContent === "ROOT")!.closest("li")!;
    const initial = {
      roots: [...root.children].filter(element => element.getAttribute("role") === "treeitem").length,
      group: childElement.parentElement?.getAttribute("role"),
      childLevel: childElement.getAttribute("aria-level"),
      childHidden: childElement.closest("[hidden]") !== null,
      leafExpanded: childElement.hasAttribute("aria-expanded"),
      textSafe: childElement.querySelector("i") === null,
      classKept: childElement.className,
      formatted: [...formatted]
    };
    handle.select(child);
    const selected = { selected: handle.selected(), expanded: [...handle.expanded()],
      hidden: childElement.closest("[hidden]") !== null, pressed: childElement.getAttribute("aria-selected") };
    childElement.focus();
    rows.set(child, "profile", { name: "Changed" });
    const changed = { same: childElement === [...root.querySelectorAll<HTMLElement>('[data-tree-label]')]
      .find(label => label.textContent === "CHANGED")?.closest("li"),
      focused: document.activeElement === childElement, formatted: [...formatted],
      text: childElement.querySelector("[data-tree-label]")!.textContent };
    rows.set(child, "parent", null);
    const reparented = { root: childElement.parentElement === root, focused: document.activeElement === childElement,
      parentExpanded: parentElement.hasAttribute("aria-expanded"), expanded: [...handle.expanded()],
      level: childElement.getAttribute("aria-level"), count: childElement.getAttribute("aria-setsize") };
    handle.select(other);
    handle.dispose();
    handle.dispose();
    const restored = root.outerHTML === original;
    rows.set(child, "profile", { name: "Detached" });
    let disposed = "";
    try { handle.selected(); } catch (cause) { disposed = (cause as { code: string }).code; }
    rows.dispose();
    root.remove();
    return { initial, selected, changed, reparented, events, restored, disposed, ids: [child, parent, other] };
  }, modules);
  expect(result).toEqual({
    initial: { roots: 2, group: "group", childLevel: "2", childHidden: true, leafExpanded: false,
      textSafe: true, classKept: "authored-node", formatted: [1, 2, 3] },
    selected: { selected: 1, expanded: [2], hidden: false, pressed: "true" },
    changed: { same: true, focused: true, formatted: [1, 2, 3, 1], text: "CHANGED" },
    reparented: { root: true, focused: true, parentExpanded: false, expanded: [], level: "1", count: "3" },
    events: [ { id: 1, raw: "<i>Child</i>", event: false }, { id: 3, raw: "Another", event: false } ],
    restored: true, disposed: "TREE_DISPOSED", ids: [1, 2, 3]
  });
});

test("Tree keyboard separates focus and selection and collapses focused descendants safely", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async ({ tree, data }) => {
    const { bindTree } = await import(tree);
    const { createRows } = await import(data);
    const root = document.createElement("ul");
    root.id = "keyboard-tree";
    root.setAttribute("aria-label", "Files");
    root.innerHTML = `<li data-row-template>
      <button type="button" data-tree-toggle aria-label="Toggle folder">+</button>
      <span data-tree-label data-field="name"></span><ul data-tree-children></ul></li>`;
    document.body.append(root);
    const rows = createRows([
      { key: "root", parent: null, name: "Alpha" },
      { key: "child", parent: "root", name: "Bravo" },
      { key: "grand", parent: "child", name: "Charlie" },
      { key: "second", parent: null, name: "Delta" },
      { key: "last", parent: null, name: "Echo" }
    ]);
    const handle = bindTree(root, { rows, key: (row: { key: string }) => row.key,
      parent: (row: { parent: string | null }) => row.parent });
    Object.assign(window, { treeHandle: handle });
    root.querySelector<HTMLElement>('[role="treeitem"]')!.focus();
  }, modules);
  const focusedLabel = () => page.evaluate(() => document.activeElement?.querySelector("[data-tree-label]")?.textContent);
  await page.keyboard.press("ArrowRight");
  expect(await focusedLabel()).toBe("Alpha");
  await page.keyboard.press("ArrowRight");
  expect(await focusedLabel()).toBe("Bravo");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  expect(await focusedLabel()).toBe("Charlie");
  await page.keyboard.press("Enter");
  await page.keyboard.press("End");
  expect(await focusedLabel()).toBe("Echo");
  expect(await page.locator('#keyboard-tree [aria-selected="true"] > [data-tree-label]').textContent()).toBe("Charlie");
  await page.keyboard.press("Home");
  await page.keyboard.press("d");
  expect(await focusedLabel()).toBe("Delta");
  await page.keyboard.press("ArrowUp");
  expect(await focusedLabel()).toBe("Charlie");
  await page.keyboard.press("ArrowLeft");
  expect(await focusedLabel()).toBe("Bravo");
  await page.keyboard.press("ArrowLeft");
  expect(await focusedLabel()).toBe("Bravo");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  expect(await focusedLabel()).toBe("Charlie");
  await page.evaluate(() => (window as unknown as { treeHandle: { setExpanded(id: number, value: boolean): void } })
    .treeHandle.setExpanded(1, false));
  expect(await focusedLabel()).toBe("Alpha");
  expect(await page.locator('#keyboard-tree [role="treeitem"][tabindex="0"]').count()).toBe(1);
  await page.keyboard.press(" ");
  expect(await page.locator('#keyboard-tree [aria-selected="true"] > [data-tree-label]').textContent()).toBe("Alpha");
});

test("Tree validates markup and hierarchy and rolls back failed initial binding", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ tree, data }) => {
    const { bindTree } = await import(tree);
    const { createRows } = await import(data);
    const failures: { code: string; unchanged: boolean; rebound: boolean }[] = [];
    const cases = [
      { values: [{ key: "x", parent: null, name: "A" }, { key: "x", parent: null, name: "B" }], code: "TREE_KEY" },
      { values: [{ key: "x", parent: "missing", name: "A" }], code: "TREE_PARENT" },
      { values: [{ key: "x", parent: "y", name: "A" }, { key: "y", parent: "x", name: "B" }], code: "TREE_CYCLE" }
    ];
    for (const entry of cases) {
      const root = document.createElement("ul");
      root.setAttribute("aria-label", "Tree");
      root.innerHTML = '<li data-row-template><span data-tree-label data-field="name"></span><ul data-tree-children></ul></li>';
      document.body.append(root);
      const original = root.outerHTML;
      const rows = createRows(entry.values);
      const options = { rows, key: (row: { key: string }) => row.key, parent: (row: { parent: string | null }) => row.parent };
      let code = "";
      try { bindTree(root, options); } catch (cause) { code = (cause as { code: string }).code; }
      const unchanged = root.outerHTML === original;
      rows.replace([{ key: "valid", parent: null, name: "Valid" }]);
      const handle = bindTree(root, options);
      const rebound = root.querySelector("[data-tree-label]")?.textContent === "Valid";
      failures.push({ code, unchanged, rebound });
      handle.dispose();
      rows.dispose();
      root.remove();
    }
    const invalid: string[] = [];
    const markups = [
      '<li data-row-template><span id="repeated" data-tree-label data-field="name"></span><ul data-tree-children></ul></li>',
      '<li data-row-template><input data-field="name"><span data-tree-label>Label</span><ul data-tree-children></ul></li>',
      '<li data-row-template><details><summary>Extra stop</summary></details><span data-tree-label>Label</span><ul data-tree-children></ul></li>',
      '<li data-row-template><span data-tree-label data-field="name"></span></li>',
      '<li data-row-template><span data-tree-label data-field="constructor.name"></span><ul data-tree-children></ul></li>'
    ];
    for (const markup of markups) {
      const root = document.createElement("ul");
      root.setAttribute("aria-label", "Invalid");
      root.innerHTML = markup;
      document.body.append(root);
      const original = root.outerHTML;
      const rows = createRows([{ key: "valid", parent: null, name: "Valid" }]);
      try { bindTree(root, { rows, key: (row: { key: string }) => row.key,
        parent: (row: { parent: string | null }) => row.parent }); }
      catch (cause) { invalid.push(`${(cause as { code: string }).code}:${root.outerHTML === original}`); }
      rows.dispose();
      root.remove();
    }
    const root = document.createElement("ul");
    root.innerHTML = '<li data-row-template><span data-tree-label>Label</span><ul data-tree-children></ul></li>';
    document.body.append(root);
    const rows = createRows([{ key: "valid", parent: null }]);
    try { bindTree(root, { rows, key: (row: { key: string }) => row.key,
      parent: (row: { parent: null }) => row.parent }); }
    catch (cause) { invalid.push((cause as { code: string }).code); }
    rows.dispose();
    root.remove();
    return { failures, invalid };
  }, modules);
  expect(result).toEqual({
    failures: [
      { code: "TREE_KEY", unchanged: true, rebound: true },
      { code: "TREE_PARENT", unchanged: true, rebound: true },
      { code: "TREE_CYCLE", unchanged: true, rebound: true }
    ], invalid: ["DUPLICATE_ID:true", "TREE_CONTROL:true", "TREE_CONTROL:true", "TREE_TEMPLATE:true", "FIELD_PATH:true", "TREE_NAME"]
  });
});

test("Tree keeps the last valid DOM on hierarchy and formatter failures and recovers", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ tree, data }) => {
    const { bindTree } = await import(tree);
    const { createRows } = await import(data);
    const root = document.createElement("ul");
    root.setAttribute("aria-label", "Recovery");
    root.innerHTML = `<li data-row-template><span data-tree-label data-field="name" data-format='[["safe"]]'></span>
      <ul data-tree-children></ul></li><li data-empty hidden>Empty</li>`;
    document.body.append(root);
    const rows = createRows([{ key: "root", parent: null, name: "Root" }, { key: "child", parent: "root", name: "Child" }]);
    const [parent, child] = rows.entries().map((row: { id: number }) => row.id);
    const events: (number | null)[] = [];
    const handle = bindTree(root, { rows, key: (row: { key: string }) => row.key,
      parent: (row: { parent: string | null }) => row.parent,
      rules: { format: { safe: (value: string) => { if (value === "fail") throw new Error("fixture"); return value; } } },
      onSelect: ({ id }: { id: number | null }) => events.push(id) });
    handle.select(child);
    const stable = root.innerHTML;
    const codes: string[] = [];
    try { rows.set(child, "parent", "missing"); } catch (cause) { codes.push((cause as { code: string }).code); }
    const hierarchyStable = root.innerHTML === stable && handle.selected() === child;
    rows.set(child, "parent", "root");
    try { rows.set(child, "name", "fail"); } catch (cause) { codes.push((cause as { code: string }).code); }
    const formatterStable = root.innerHTML === stable && handle.selected() === child;
    rows.set(child, "name", "Recovered");
    const recovered = root.querySelector('[aria-level="2"] > [data-tree-label]')?.textContent;
    rows.remove(child);
    const removed = { selected: handle.selected(), events: [...events], leaf: !root.querySelector('[role="treeitem"]')?.hasAttribute("aria-expanded") };
    rows.remove(parent);
    const empty = { visible: !root.querySelector<HTMLLIElement>("[data-empty]")!.hidden,
      nodes: root.querySelectorAll('[role="treeitem"]').length, tabIndex: root.tabIndex };
    let missing = "";
    try { handle.select(child); } catch (cause) { missing = (cause as { code: string }).code; }
    handle.dispose();
    rows.dispose();
    root.remove();
    return { codes, hierarchyStable, formatterStable, recovered, removed, empty, missing };
  }, modules);
  expect(result).toEqual({ codes: ["TREE_PARENT", "RULE_FAILED"], hierarchyStable: true, formatterStable: true,
    recovered: "Recovered", removed: { selected: null, events: [2, null], leaf: true },
    empty: { visible: true, nodes: 0, tabIndex: 0 }, missing: "TREE_ROW" });
});

test("two Trees keep generated label IDs unique and their state independent", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ tree, data }) => {
    const { bindTree } = await import(tree);
    const { createRows } = await import(data);
    const rows = createRows([{ key: 1, parent: null, name: "Root" }, { key: "1", parent: 1, name: "Child" }]);
    const roots = Array.from({ length: 2 }, (_, index) => {
      const root = document.createElement("ol");
      root.setAttribute("aria-label", `Tree ${index + 1}`);
      root.innerHTML = '<li data-row-template><span data-tree-label data-field="name"></span><ol data-tree-children></ol></li>';
      document.body.append(root);
      return root;
    });
    const options = { rows, key: (row: { key: string | number }) => row.key,
      parent: (row: { parent: number | null }) => row.parent };
    const [first, second] = roots.map(root => bindTree(root, options));
    let ownership = "";
    try { bindTree(roots[0], options); } catch (cause) { ownership = (cause as { code: string }).code; }
    roots[0].querySelector<HTMLElement>('[role="treeitem"]')!.click();
    first.setExpanded(1, true);
    rows.set(2, "name", "Both updated");
    const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map(element => element.id);
    const links = roots.every(root => [...root.querySelectorAll<HTMLElement>('[role="treeitem"]')]
      .every(element => element.querySelector("[data-tree-label]")?.id === element.getAttribute("aria-labelledby")));
    const result = { ownership, unique: ids.length === new Set(ids).size, links,
      selected: [first.selected(), second.selected()], expanded: [first.expanded(), second.expanded()],
      updates: roots.map(root => root.querySelector('[aria-level="2"] > [data-tree-label]')?.textContent) };
    first.dispose();
    const rebound = bindTree(roots[0], options);
    rebound.dispose();
    second.dispose();
    rows.dispose();
    roots.forEach(root => root.remove());
    return result;
  }, modules);
  expect(result).toEqual({ ownership: "TREE_IN_USE", unique: true, links: true,
    selected: [1, null], expanded: [[1], []], updates: ["Both updated", "Both updated"] });
});

test("Tree can reverse prior DOM ancestry while keeping RowIds and selected focus", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ tree, data }) => {
    const { bindTree } = await import(tree);
    const { createRows } = await import(data);
    const root = document.createElement("ul");
    root.setAttribute("aria-label", "Reparented tree");
    root.innerHTML = '<li data-row-template><span data-tree-label data-field="name"></span><ul data-tree-children></ul></li>';
    document.body.append(root);
    const rows = createRows([{ key: "b", name: "B" }, { key: "a", name: "A" }]);
    let reversed = false;
    const handle = bindTree(root, { rows, key: (row: { key: string }) => row.key,
      parent: (row: { key: string }) => reversed ? (row.key === "b" ? null : "b") : (row.key === "a" ? null : "a") });
    const a = [...root.querySelectorAll<HTMLElement>("[data-tree-label]")].find(label => label.textContent === "A")!.closest("li")!;
    const b = [...root.querySelectorAll<HTMLElement>("[data-tree-label]")].find(label => label.textContent === "B")!.closest("li")!;
    handle.select(2);
    a.focus();
    reversed = true;
    rows.set(1, "name", "B updated");
    const result = { root: b.parentElement === root, child: a.parentElement?.parentElement === b,
      selected: handle.selected(), expanded: [...handle.expanded()], focused: document.activeElement === a,
      visible: a.closest("[hidden]") === null, ids: rows.entries().map((row: { id: number }) => row.id) };
    handle.dispose();
    rows.dispose();
    root.remove();
    return result;
  }, modules);
  expect(result).toEqual({ root: true, child: true, selected: 2, expanded: [1], focused: true, visible: true, ids: [1, 2] });
});

test("Tree measured binding updates preserve records for 1,000 flat and nested rows", async ({ page }, testInfo) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ tree, data }) => {
    const { bindTree } = await import(tree);
    const { createRows } = await import(data);
    const measurements: { layout: string; bindMs: number; updateMs: number; sameRecords: boolean; nodes: number }[] = [];
    for (const layout of ["flat", "nested"]) {
      for (let run = 0; run < 7; run++) {
        const root = document.createElement("ul");
        root.setAttribute("aria-label", "Measured tree");
        root.innerHTML = '<li data-row-template><span data-tree-label data-field="profile.name"></span><ul data-tree-children></ul></li>';
        document.body.append(root);
        const rows = createRows(Array.from({ length: 1000 }, (_, key) => ({ key,
          parent: layout === "flat" || key % 10 === 0 ? null : key - key % 10,
          profile: { name: `Node ${key}` } })));
        const started = performance.now();
        const handle = bindTree(root, { rows, key: (row: { key: number }) => row.key,
          parent: (row: { parent: number | null }) => row.parent });
        const bindMs = performance.now() - started;
        const before = [...root.querySelectorAll('[role="treeitem"]')];
        const updateStarted = performance.now();
        rows.set(500, "profile", { name: "Updated" });
        const updateMs = performance.now() - updateStarted;
        const after = [...root.querySelectorAll('[role="treeitem"]')];
        if (run >= 2) measurements.push({ layout, bindMs, updateMs, nodes: after.length,
          sameRecords: before.length === after.length && before.every((element, index) => element === after[index]) });
        handle.dispose();
        rows.dispose();
        root.remove();
      }
    }
    return { rows: 1000, fields: 1, warmup: 2, samples: 5, measurements };
  }, modules);
  expect(result.measurements).toHaveLength(10);
  expect(result.measurements.every(sample => sample.sameRecords && sample.nodes === 1000)).toBe(true);
  const report = testInfo.outputPath("tree-binding.json");
  await writeFile(report, JSON.stringify(result, null, 2));
  await testInfo.attach("tree-binding-measurements", { path: report, contentType: "application/json" });
});

test("Tree handles a deep hierarchy without recursive traversal", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ tree, data }) => {
    const { bindTree } = await import(tree);
    const { createRows } = await import(data);
    const root = document.createElement("ul");
    root.setAttribute("aria-label", "Deep tree");
    root.innerHTML = '<li data-row-template><span data-tree-label data-field="name"></span><ul data-tree-children></ul></li>';
    document.body.append(root);
    const values = Array.from({ length: 1000 }, (_, index) => ({ key: index, parent: index === 0 ? null : index - 1,
      name: `Node ${index}` }));
    const rows = createRows(values);
    const handle = bindTree(root, { rows, key: (row: { key: number }) => row.key,
      parent: (row: { parent: number | null }) => row.parent });
    handle.select(1000);
    const result = { count: root.querySelectorAll('[role="treeitem"]').length,
      depth: root.querySelector('[aria-level="1000"]')?.getAttribute("aria-selected"), expanded: handle.expanded().length };
    handle.dispose();
    rows.dispose();
    root.remove();
    return result;
  }, modules);
  expect(result).toEqual({ count: 1000, depth: "true", expanded: 999 });
});

test("authored Tree states pass automated A and AA checks", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async ({ tree, data }) => {
    const { bindTree } = await import(tree);
    const { createRows } = await import(data);
    const section = document.createElement("section");
    section.id = "accessible-tree";
    section.innerHTML = `<h2 id="tree-heading">Departments</h2><ul aria-labelledby="tree-heading">
      <li data-row-template><button type="button" data-tree-toggle aria-label="Toggle department">+</button>
      <span data-tree-label data-field="name"></span><ul data-tree-children></ul></li>
      <li data-empty hidden>No departments</li></ul>`;
    document.body.append(section);
    const rows = createRows([{ key: 1, parent: null, name: "Root" }, { key: 2, parent: 1, name: "Child" }]);
    const handle = bindTree(section.querySelector("ul")!, { rows, key: (row: { key: number }) => row.key,
      parent: (row: { parent: number | null }) => row.parent });
    handle.select(2);
    Object.assign(window, { accessibleTreeRows: rows });
  }, modules);
  const analyze = () => new AxeBuilder({ page }).include("#accessible-tree")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect((await analyze()).violations).toEqual([]);
  await page.evaluate(() => (window as unknown as { accessibleTreeRows: { replace(values: object[]): void } })
    .accessibleTreeRows.replace([]));
  expect((await analyze()).violations).toEqual([]);
});

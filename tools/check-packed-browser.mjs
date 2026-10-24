import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import { createServer } from "vite";

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const fixtureDir = path.join(packageDir, "tests", "consumers", "browser");
const npmCli = process.env.npm_execpath;
const browsers = new Map([
  ["chromium", { engine: chromium }],
  ["firefox", { engine: firefox }],
  ["webkit", { engine: webkit }],
  ["chrome", { engine: chromium, channel: "chrome" }],
  ["edge", { engine: chromium, channel: "msedge" }]
]);

function options(args) {
  const usage = "Use --tarball <path.tgz> --sha256 <64-hex-digest> [--browser chromium|firefox|webkit|chrome|edge].";
  if (args.length % 2 !== 0) throw new Error(usage);
  const values = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    const value = args[index + 1];
    if (!["--tarball", "--sha256", "--browser"].includes(name) ||
        values.has(name) || !value || value.startsWith("--")) throw new Error(usage);
    values.set(name, value);
  }
  const expected = values.get("--sha256");
  const browserName = values.get("--browser") ?? "chromium";
  if (!values.has("--tarball") || !expected || !/^[0-9a-f]{64}$/i.test(expected) ||
      !browsers.has(browserName)) throw new Error(usage);
  const candidate = path.resolve(values.get("--tarball"));
  const file = statSync(candidate, { throwIfNoEntry: false });
  if (!candidate.toLowerCase().endsWith(".tgz") || !file?.isFile()) {
    throw new Error("Tarball must be an existing .tgz file.");
  }
  const tarball = realpathSync(candidate);
  const actual = createHash("sha256").update(readFileSync(tarball)).digest("hex");
  if (actual !== expected.toLowerCase()) {
    throw new Error(`Tarball SHA-256 mismatch: expected ${expected.toLowerCase()}, got ${actual}.`);
  }
  return { tarball, sha256: actual, browserName };
}

if (!npmCli) throw new Error("Run through npm run so npm_execpath is available.");
const { tarball, sha256, browserName } = options(process.argv.slice(2));
const tempParent = realpathSync(tmpdir());
const tempRoot = realpathSync(mkdtempSync(path.join(tempParent, "natural-js-packed-browser-")));
const consumerDir = path.join(tempRoot, "app");
let vite;
let browser;

function removeOwnedTempRoot() {
  const relative = path.relative(tempParent, tempRoot);
  if (!relative.startsWith("natural-js-packed-browser-") || relative.includes(path.sep) ||
      relative === "." || path.isAbsolute(relative)) {
    throw new Error(`Refusing to remove an unexpected temporary path: ${tempRoot}`);
  }
  rmSync(tempRoot, { recursive: true });
}

try {
  cpSync(fixtureDir, consumerDir, { recursive: true });
  execFileSync(process.execPath, [npmCli,
    "install", "--offline", "--no-save", "--package-lock=false", "--ignore-scripts",
    "--no-audit", "--no-fund", tarball
  ], { cwd: consumerDir, stdio: "inherit" });

  vite = await createServer({
    root: consumerDir,
    configFile: false,
    logLevel: "error",
    server: { host: "127.0.0.1", port: 0, strictPort: false }
  });
  await vite.listen();
  const address = vite.httpServer.address();
  assert(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/`;

  const selected = browsers.get(browserName);
  browser = await selected.engine.launch({ headless: true, ...(selected.channel && { channel: selected.channel }) });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(url);
  try {
    await page.waitForFunction(() => window.packedConsumer?.ready || window.packedConsumer?.error,
      undefined, { timeout: 20_000 });
  } catch (cause) {
    throw new Error("Packed consumer did not initialize: " + (errors.join(" | ") || cause.message),
      { cause });
  }
  const setupError = await page.evaluate(() => window.packedConsumer.error);
  assert(!setupError, `Packed consumer setup failed: ${setupError}`);

  const controls = await page.evaluate(() => {
    const b = window.packedConsumer.blocks;
    const [first, second] = b.rows.entries();
    const detail = b.table.tBodies[0].rows[3];
    const name = b.table.tBodies[0].rows[2].querySelector("input");
    const selected = detail.querySelector("select[multiple]");
    b.form.bind(second.id); b.grid.select(first.id); b.grid.setSelected([first.id, second.id]); b.grid.setChecked([first.id]);
    detail.querySelector("[data-check-row]").click();
    const checks = { checked: b.grid.checkedIds(), selected: b.grid.selectedIds(), active: b.grid.selected() };
    name.value = ""; name.dispatchEvent(new Event("input", { bubbles: true })); name.dispatchEvent(new Event("change", { bubbles: true }));
    const deferred = b.rows.get(second.id) === second;
    const invalid = b.grid.validate(second.id);
    const revealed = !invalid.valid && invalid.issues[0].element === name && document.activeElement === name;
    name.value = "Manual assignment"; name.dispatchEvent(new Event("input", { bubbles: true })); name.dispatchEvent(new Event("change", { bubbles: true }));
    const validated = b.grid.validate(second.id).valid && b.detail.querySelector("input").value === "Manual assignment";
    detail.querySelector('input[type="radio"][value="remote"]').click();
    detail.querySelector('input[type="checkbox"][value="beta"]').click();
    for (const option of selected.options) option.selected = option.text === "False" || option.text === "Empty";
    selected.dispatchEvent(new Event("change", { bubbles: true }));
    const groupsDeferred = b.rows.get(second.id).value.settings.mode === "office";
    const groupsValid = b.grid.validate(second.id).valid;
    const groups = b.rows.get(second.id).value.settings;
    const events = []; const stop = b.rows.subscribe(event => events.push(event.type));
    const text = ["office", JSON.stringify(["beta"]), JSON.stringify([11, false, null])]
      .map(value => `"${value.replaceAll('"', '""')}"`).join("\t");
    const pasted = b.grid.paste(text, { id: second.id, field: "settings.mode" });
    const arrayValue = b.rows.get(second.id).value.settings;
    const pasteEvents = [...events]; events.length = 0; const beforeInvalid = b.rows.entries();
    const rejected = b.grid.paste("[99]", { id: second.id, field: "settings.selected" });
    const rejection = { valid: rejected.valid, unchanged: b.rows.entries() === beforeInvalid, events: events.length,
      revealed: rejected.issues[0]?.element === selected && document.activeElement === selected };
    stop();
    b.rows.set(second.id, "summary", "<b>Stored summary</b>");
    const rendered = detail.querySelector("strong").textContent === "<b>Stored summary</b>" &&
      b.detail.querySelector("em").textContent === "<b>Stored summary</b>" && !detail.querySelector("b");
    const names = [...b.table.querySelectorAll('input[type="radio"]')].map(input => input.name);
    const result = { deferred, revealed, validated, groupsDeferred, groupsValid, groups, arrayValue,
      pasted: pasted.valid, pasteEvents, rejection, rendered, radioGroups: new Set(names).size, checks,
      expected: { first: first.id, second: second.id } };
    b.rows.revert(); b.form.bind(first.id); b.grid.setChecked([]); b.grid.setSelected([]); b.grid.select(null);
    return result;
  });
  assert(controls.deferred && controls.revealed && controls.validated && controls.groupsDeferred && controls.groupsValid,
    "Installed manual validation must retain drafts, reveal their field and update the shared Form after validation.");
  assert.deepEqual({ mode: controls.groups.mode, tags: controls.groups.tags, selected: controls.groups.selected },
    { mode: "remote", tags: ["alpha", "beta"], selected: [false, null] });
  assert(controls.pasted && controls.rendered, "Installed controls and explicit Form/Grid renderers must preserve raw values.");
  assert.deepEqual({ mode: controls.arrayValue.mode, tags: controls.arrayValue.tags, selected: controls.arrayValue.selected },
    { mode: "office", tags: ["beta"], selected: [11, false, null] });
  assert.deepEqual(controls.pasteEvents, ["setMany"]);
  assert.deepEqual(controls.rejection, { valid: false, unchanged: true, events: 0, revealed: true });
  assert.equal(controls.radioGroups, 4, "Installed radio names must isolate each logical record without a native form.");
  assert.deepEqual(controls.checks, { checked: [controls.expected.second],
    selected: [controls.expected.first, controls.expected.second], active: controls.expected.first });

  const blocks = await page.evaluate(() => {
    const b = window.packedConsumer.blocks;
    const [first, second] = b.rows.entries();
    const physical = [...b.table.tBodies[0].rows];
    const initial = { count: physical.length, span: physical[0].cells[0].rowSpan,
      follower: getComputedStyle(physical[2].cells[0]).display };
    const note = physical[3].querySelector("textarea");
    note.focus(); note.setSelectionRange(1, 4);
    physical[3].querySelector("button").click();
    b.rows.move(second.id, first.id);
    const retained = b.table.tBodies[0].rows[1].querySelector("textarea") === note;
    const result = b.grid.paste("Updated\t22\tPasted note", { id: second.id, field: "profile.name" });
    const value = b.rows.get(second.id).value.profile;
    const focused = document.activeElement === note;
    b.form.dispose(); const detailRestored = b.detail.outerHTML === b.originalDetail;
    b.grid.dispose(); const restored = b.table.outerHTML === b.original;
    b.rows.dispose(); b.root.remove();
    return { initial, action: b.lastAction === second.id, retained, focused, valid: result.valid, value, restored, detailRestored };
  });
  assert.deepEqual(blocks.initial, { count: 8, span: 8, follower: "none" });
  assert(blocks.action && blocks.retained && blocks.focused && blocks.valid && blocks.restored && blocks.detailRestored,
    "Installed native row blocks must retain one identity, nested binding, focus and exact teardown.");
  assert.equal(blocks.value.name, "Updated");
  assert.equal(blocks.value.choice, 22);
  assert.equal(blocks.value.note, "Pasted note");

  const lifecycle = await page.evaluate(() => {
    const state = window.packedConsumer, h = state.lifecycle;
    const originalValue = h.rows.original(1);
    const markers = root => [...root.querySelectorAll("[data-field]")].map(field => field.getAttribute("data-field-changed"));
    const cleanFields = { grid: markers(h.table), original: originalValue,
      frozen: Object.isFrozen(originalValue) };
    const defaults = h.grid.defaults();
    const inserted = h.rows.add(defaults);
    h.grid.setStatusFilter(["insert"]);
    const insertedView = { id: inserted, status: h.table.tBodies[0].rows[0].dataset.rowStatus,
      name: h.table.querySelector('[data-field="name"]').value };
    const insertedFields = { grid: markers(h.table), noOriginal: h.rows.original(inserted) === undefined };
    const clicks = h.clicks;
    h.grid.refresh(); h.table.tBodies[0].rows[0].click();
    const refreshed = { active: h.active, once: h.clicks === clicks + 1 };
    h.grid.setStatusFilter(["clean", "insert", "update", "delete"]);
    h.rows.set(1, "name", "Edited before delete");
    const dirtyFields = { grid: markers(h.table.tBodies[0].rows[0]),
      originalUnchanged: h.rows.original(1) === originalValue };
    h.rows.remove(1);
    const deleted = h.table.tBodies[0].rows[0];
    const protectedDeletion = deleted.dataset.rowStatus === "delete" && deleted.querySelector("input").disabled &&
      h.rows.entries().length === 1 && h.rows.entries({ includeDeleted: true }).length === 2;
    const deletedFields = { value: deleted.querySelector('[data-field="name"]').value,
      stored: h.rows.get(1).value.name, grid: markers(deleted),
      payload: h.rows.changes().find(row => row.id === 1).value.name, originalUnchanged: h.rows.original(1) === originalValue };
    deleted.querySelector("button").click();
    const undo = h.rows.get(1).status === "clean" && h.rows.get(1).value.name === "Original";
    const undoFields = { grid: markers(h.table.tBodies[0].rows[0]),
      value: h.table.querySelector('[data-field="name"]').value, originalUnchanged: h.rows.original(1) === originalValue };
    h.table.tBodies[0].rows[1].querySelector("button").click();
    h.grid.setStatusFilter(["delete"]);
    const empty = !h.table.querySelector("[data-empty]").hidden && h.active === 0;
    const original = h.rows.get(1);
    const ids = h.rows.append([{ name: "Loaded page one", score: 11 }, { name: "Loaded page two", score: 12 }]);
    const appendedOriginals = ids.map(id => h.rows.original(id));
    const appended = { ids, clean: ids.every(id => h.rows.get(id).status === "clean"), original: h.rows.get(1) === original,
      changes: h.rows.changes(), events: h.events.filter(event => event.type === "append"), bind: h.binds.at(-1) };
    h.grid.setStatusFilter(["clean"]);
    const shown = [...h.table.querySelectorAll('tbody [data-field="name"]')].map(input => input.value);
    const active = h.active;
    const row = h.table.tBodies[0].rows[0], beforeDispose = h.clicks;
    h.grid.dispose(); row.click();
    const cleanup = { active: h.active, noLateClick: h.clicks === beforeDispose, restored: h.table.outerHTML === h.original };
    h.stop(); h.rows.dispose(); h.root.remove(); delete state.lifecycle;
    return { defaults, insertedView, refreshed, protectedDeletion, undo, empty, appended, shown, active, cleanup,
      cleanFields, insertedFields, dirtyFields, deletedFields, undoFields, appendedOriginals };
  });
  assert.deepEqual(lifecycle.cleanFields, { grid: ["false", "false"],
    original: { name: "Original", score: 10 }, frozen: true });
  assert.deepEqual(lifecycle.defaults, { name: "Default employee", score: 25 });
  assert.deepEqual(lifecycle.insertedView, { id: 2, status: "insert", name: "Default employee" });
  assert.deepEqual(lifecycle.insertedFields, { grid: ["false", "false"], noOriginal: true });
  assert.deepEqual(lifecycle.refreshed, { active: 1, once: true }, "Refresh must replace owned row listeners without accumulating them.");
  assert.deepEqual(lifecycle.dirtyFields, { grid: ["true", "false"], originalUnchanged: true });
  assert.deepEqual(lifecycle.deletedFields, { value: "Edited before delete", stored: "Edited before delete",
    grid: ["true", "false"], payload: "Original", originalUnchanged: true },
  "Installed deleted views must retain committed edits and dirty flags while changes() sends the loaded original.");
  assert(lifecycle.protectedDeletion && lifecycle.undo && lifecycle.empty, "Installed status views must protect deletions, allow Undo and toggle authored empty markup.");
  assert.deepEqual(lifecycle.undoFields, { grid: ["false", "false"],
    value: "Original", originalUnchanged: true });
  assert.deepEqual(lifecycle.appended, { ids: [3, 4], clean: true, original: true, changes: [],
    events: [{ type: "append", ids: [3, 4], changed: true }],
    bind: { total: 3, filtered: 0, visible: 0, mounted: 0, event: "append" } });
  assert.deepEqual(lifecycle.appendedOriginals, [{ name: "Loaded page one", score: 11 }, { name: "Loaded page two", score: 12 }]);
  assert.deepEqual(lifecycle.shown, ["Original", "Loaded page one", "Loaded page two"]);
  assert.equal(lifecycle.active, 3);
  assert.deepEqual(lifecycle.cleanup, { active: 0, noLateClick: true, restored: true });

  const ordered = await page.evaluate(() => {
    const { rows, grid } = window.packedConsumer.viewport;
    const [first] = rows.entries();
    const last = rows.entries().at(-1);
    grid.setSelected([first.id, last.id]); grid.setChecked([first.id, last.id]);
    const events = [];
    const stop = rows.subscribe(event => events.push(event.type));
    const inserted = rows.add({ name: "Inserted", choices: first.value.choices, choice: first.value.choice }, first.id);
    const copied = rows.copy(first.id, inserted);
    rows.move(last.id, first.id);
    const snapshot = rows.get(copied);
    rows.set(copied, "name", "Independent copy");
    const result = {
      order: rows.entries().slice(0, 4).map(row => row.id), expected: [copied, inserted, last.id, first.id],
      selected: grid.selectedIds(), checked: grid.checkedIds(), expectedMembership: [last.id, first.id],
      sameSource: rows.get(first.id) === first && rows.get(last.id) === last,
      independent: snapshot.value.choices !== first.value.choices && rows.get(first.id).value.name === first.value.name,
      events: [...events]
    };
    rows.remove(copied); rows.remove(inserted); rows.move(last.id);
    grid.setSelected([]); grid.setChecked([]); grid.reveal(first.id);
    stop();
    return result;
  });
  assert.deepEqual(ordered.order, ordered.expected, "Installed insert/copy/move must use stable target IDs.");
  assert.deepEqual(ordered.selected, ordered.expectedMembership);
  assert.deepEqual(ordered.checked, ordered.expectedMembership);
  assert(ordered.sameSource && ordered.independent, "Installed copy must be independent and move must preserve source snapshots.");
  assert.deepEqual(ordered.events, ["add", "add", "move", "set"]);

  const viewportRows = page.locator('[data-consumer-viewport] tbody tr:not([aria-hidden="true"])');
  await expect.poll(() => viewportRows.count()).toBeGreaterThan(0);
  assert(await viewportRows.count() < 80, "Installed viewport must bound the mounted 5,000-row table.");
  const viewportWrite = await page.evaluate(() => {
    const v = window.packedConsumer.viewport;
    const ids = v.rows.entries().map(row => row.id);
    const events = [];
    const stop = v.rows.subscribe(event => events.push(event));
    const result = v.grid.paste(Array.from({ length: 1000 }, (_, index) => `Pasted ${index + 1}\t22`).join("\n"),
      { id: ids[1000], field: "name" });
    v.grid.checkAll(true, "visible");
    v.grid.reveal(ids[1999]);
    stop();
    return { valid: result.valid, events: events.map(event => ({ type: event.type, count: event.ids?.length })),
      stable: v.rows.entries().every((row, index) => row.id === ids[index]),
      last: v.rows.get(ids[1999]).value, checked: v.grid.checkedIds().length, active: v.grid.selected() };
  });
  assert(viewportWrite.valid && viewportWrite.stable, "Installed offscreen paste must preserve every RowId.");
  assert.deepEqual(viewportWrite.events, [{ type: "setMany", count: 1000 }]);
  assert.equal(viewportWrite.last.name, "Pasted 1000");
  assert.equal(viewportWrite.last.choice, 22, "Offscreen Select paste must retain numeric choices.");
  assert.equal(viewportWrite.checked, 5000, "Visible checks cover the logical page, not mounted rows.");
  assert.equal(viewportWrite.active, null, "Reveal must not select a row.");
  await expect.poll(async () => page.evaluate(() => {
    const v = window.packedConsumer.viewport;
    return [...v.table.querySelectorAll('input[data-field="name"]')].some(input => input.value === "Pasted 1000");
  })).toBe(true);
  assert(await viewportRows.count() < 80, "Offscreen paste/reveal must not mount all target rows.");
  const viewportCleanup = await page.evaluate(async () => {
    const v = window.packedConsumer.viewport;
    v.root.scrollTop = v.root.scrollHeight;
    v.root.dispatchEvent(new Event("scroll"));
    v.grid.dispose();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const restored = v.table.outerHTML === v.original;
    v.rows.dispose(); v.root.remove();
    return restored;
  });
  assert(viewportCleanup, "Installed viewport disposal must restore the exact authored table with pending work.");

  const geometry = await page.evaluate(async () => {
    const h = window.packedConsumer.geometry;
    const ids = h.grid.rowIds("visible");
    const snapshots = { count: ids.length, filtered: h.grid.rowIds("filtered").length,
      store: h.grid.rowIds("store").length, frozen: Object.isFrozen(ids) };
    h.grid.reveal(ids[49], { block: "center" });
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const target = [...h.table.querySelectorAll("tbody tr")].find(row => row.textContent.includes("Geometry 50"));
    const head = h.table.tHead.getBoundingClientRect(), foot = h.table.tFoot.getBoundingClientRect();
    const bounds = target?.getBoundingClientRect();
    const centered = !!bounds && bounds.top >= head.bottom - 1 && bounds.bottom <= foot.top + 1 &&
      Math.abs((bounds.top + bounds.bottom - head.bottom - foot.top) / 2) <= 2;
    const originalHeight = h.root.getBoundingClientRect().height;
    h.handle.focus();
    h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    const resized = h.root.getBoundingClientRect().height;
    const accessible = { role: h.handle.getAttribute("role"), controls: h.handle.getAttribute("aria-controls") === h.root.id,
      height: Number(h.handle.getAttribute("aria-valuenow")) };
    h.grid.setFilter(row => row.name === "Geometry 50");
    const filtered = { visible: h.grid.rowIds("visible"), filtered: h.grid.rowIds("filtered"), store: h.grid.rowIds("store").length,
      oldSnapshot: ids.length, active: h.grid.selected() };
    h.grid.dispose();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const restored = h.container.outerHTML === h.original;
    h.handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    const quiet = h.container.outerHTML === h.original;
    h.rows.dispose(); h.container.remove();
    return { snapshots, centered, originalHeight, resized, accessible, filtered, restored, quiet };
  });
  assert.deepEqual(geometry.snapshots, { count: 100, filtered: 100, store: 100, frozen: true });
  assert(geometry.centered, "Installed centered reveal must fit between sticky header and footer.");
  assert.equal(geometry.resized, geometry.originalHeight + 10);
  assert.deepEqual(geometry.accessible, { role: "separator", controls: true, height: geometry.resized });
  assert.deepEqual(geometry.filtered, { visible: [50], filtered: [50], store: 100, oldSnapshot: 100, active: null });
  assert(geometry.restored && geometry.quiet, "Installed geometry must restore authored markup and release listeners.");

  for (const [slot, name] of [["a", "Ada"], ["b", "Bea"]]) {
    const host = page.locator(`[data-host="${slot}"]`);
    await expect(host.locator("article")).toHaveCount(1);
    await expect(host.locator("form input")).toHaveValue(name);
    await expect(host.locator("[data-consumer-grid] tbody [data-field='person.name']")).toHaveText(name);
    await expect(host.locator("select option")).toHaveText(["Choose", "Eleven", "Twenty two"]);
    await expect(host.locator("select")).toHaveValue("11");
    assert.deepEqual(await page.evaluate(slot => window.packedConsumer.screens[slot].grid.page(), slot),
      { page: 1, size: 1, total: 2, pages: 2 }, "Installed Grid must apply its initial page before rendering.");
    assert.deepEqual(await page.evaluate(slot => window.packedConsumer.screens[slot].grid.columns(), slot),
      [{ key: "person", width: 180 }, { key: "choice", width: 120 }],
      "Installed Grid must expose its preferred column widths.");
    await expect(host.locator("[data-consumer-grid] tbody tr")).toHaveCount(1);
  }
  const ids = await page.evaluate(() => [...document.querySelectorAll("[id]")].map(item => item.id));
  assert.equal(new Set(ids).size, ids.length, "Live CVC screens contain duplicate IDs.");
  assert(ids.length >= 4, "Expected Form error and calendar title IDs in both screens.");
  const described = await page.evaluate(() => [...document.querySelectorAll("form")].every(form =>
    form.querySelector("input").getAttribute("aria-describedby") === form.querySelector("output").id));
  assert(described, "Form errors must be described by unique, connected regions.");

  const first = page.locator('[data-host="a"]');
  const gridBefore = await page.evaluate(() => {
    const state = window.packedConsumer;
    const notifications = { a: 0, b: 0 };
    state.gridProbe = {
      notifications,
      unsubscribe: Object.entries(state.screens).map(([slot, screen]) =>
        screen.rows.subscribe(() => notifications[slot]++)),
      roots: [...document.querySelectorAll('[data-host] article')],
      form: document.querySelector('[data-host="a"] form'),
      input: document.querySelector('[data-host="a"] form input'),
      header: document.querySelector('[data-host="a"] [data-consumer-grid] thead th'),
      person: document.querySelector('[data-host="a"] [data-consumer-grid] tbody [data-field="person.name"]'),
      choice: document.querySelector('[data-host="a"] [data-consumer-grid] select')
    };
    return Object.fromEntries(Object.entries(state.screens).map(([slot, screen]) =>
      [slot, { entries: screen.rows.entries(), changes: screen.rows.changes() }]));
  });
  const gridApi = await page.evaluate(() => {
    const screen = window.packedConsumer.screens.a;
    const [first, second] = screen.rows.entries();
    screen.grid.select(first.id);
    screen.grid.setSelected([second.id]);
    screen.grid.setChecked([first.id]);
    return {
      ids: [first.id, second.id], active: screen.grid.selected(),
      selected: screen.grid.selectedIds(), checked: screen.grid.checkedIds(),
      filter: screen.grid.columnFilter("choice"), choices: screen.grid.filterChoices("choice"),
      matching: screen.grid.filterChoices("choice", "twENTY"),
      events: screen.gridEvents,
      frozen: Object.isFrozen(screen.grid.selectedIds()) && Object.isFrozen(screen.grid.checkedIds()) &&
        Object.isFrozen(screen.grid.filterChoices("choice"))
    };
  });
  const [firstId, secondId] = gridApi.ids;
  assert.equal(gridApi.active, firstId);
  assert.deepEqual(gridApi.selected, [secondId], "Active detail and selected IDs must be independent.");
  assert.deepEqual(gridApi.checked, [firstId], "Checked IDs must be independent of selected IDs.");
  assert.equal(gridApi.filter, null);
  assert.deepEqual(gridApi.choices, [
    { value: 11, label: "Eleven", count: 1 }, { value: 22, label: "Twenty two", count: 1 }
  ], "Installed distinct choices must retain numeric raw values and counts.");
  assert.deepEqual(gridApi.matching, [{ value: 22, label: "Twenty two", count: 1 }]);
  assert(gridApi.frozen, "Installed Grid must expose immutable ID and choice snapshots.");
  assert.deepEqual(gridApi.events.map(event => event.kind),
    ["before-active", "active", "before-selection", "selection", "before-check", "check"]);
  assert(gridApi.events.every(event => event.type === null), "Programmatic Grid callbacks must have null events.");
  assert.deepEqual(gridApi.events[3], { kind: "selection", ids: [secondId], previous: [], type: null });
  assert.deepEqual(gridApi.events[5], { kind: "check", ids: [firstId], previous: [], type: null });
  await first.locator("[data-select-row]").click({ modifiers: ["Control"] });
  await expect(first.locator("[data-select-row]")).toHaveAttribute("aria-pressed", "true");
  assert.deepEqual(await page.evaluate(() => window.packedConsumer.screens.a.grid.selectedIds()), [firstId, secondId]);
  await first.locator("[data-check-row]").uncheck();
  await first.locator("[data-check-all]").check();
  await expect(first.locator("[data-check-all]")).toHaveJSProperty("indeterminate", false);
  const checkedScopes = await page.evaluate(() => {
    const state = window.packedConsumer;
    const grid = state.screens.a.grid;
    const probe = state.gridProbe;
    probe.sameRowFields = probe.person === document.querySelector('[data-host="a"] [data-consumer-grid] tbody [data-field="person.name"]') &&
      probe.choice === document.querySelector('[data-host="a"] [data-consumer-grid] select');
    const afterHeader = { visible: grid.checkState("visible"), store: grid.checkState("store") };
    grid.checkAll(true, "store");
    grid.checkAll(false, "visible");
    grid.setColumnFilter("choice", [11]);
    const filtered = { values: grid.columnFilter("choice"), page: grid.page(), state: grid.checkState("filtered") };
    grid.checkAll(true, "filtered");
    grid.checkAll(false, "filtered");
    return { afterHeader, filtered, checked: grid.checkedIds(), active: grid.selected(),
      selected: grid.selectedIds(), events: state.screens.a.gridEvents };
  });
  assert.deepEqual(checkedScopes.afterHeader, {
    visible: { checked: true, indeterminate: false, total: 1, count: 1 },
    store: { checked: false, indeterminate: true, total: 2, count: 1 }
  });
  assert.deepEqual(checkedScopes.filtered, {
    values: [11], page: { page: 1, size: 1, total: 1, pages: 1 },
    state: { checked: false, indeterminate: false, total: 1, count: 0 }
  });
  assert.deepEqual(checkedScopes.checked, [secondId], "Scoped check-all must preserve checks outside its scope.");
  assert.equal(checkedScopes.active, firstId);
  assert.deepEqual(checkedScopes.selected, [firstId, secondId]);
  assert(checkedScopes.events.some(event => event.kind === "selection" && event.type === "click"));
  assert(checkedScopes.events.some(event => event.kind === "check" && event.type === "change"));
  const filteredIdentity = await page.evaluate(() => {
    const grid = window.packedConsumer.screens.a.grid;
    grid.setColumnFilter("choice", [22]);
    const result = { active: grid.selected(), selected: grid.selectedIds(), checked: grid.checkedIds(),
      visible: grid.checkState("visible"), values: grid.columnFilter("choice") };
    grid.setColumnFilter("choice", null);
    return result;
  });
  assert.deepEqual(filteredIdentity, {
    active: firstId, selected: [firstId, secondId], checked: [secondId], values: [22],
    visible: { checked: true, indeterminate: false, total: 1, count: 1 }
  });
  const sortPerson = first.locator('[data-sort-column="person"]');
  await sortPerson.click();
  await expect(first.locator('[data-consumer-grid] th[data-column="person"]').first()).toHaveAttribute("aria-sort", "ascending");
  await sortPerson.click();
  await expect(first.locator('[data-consumer-grid] th[data-column="person"]').first()).toHaveAttribute("aria-sort", "descending");
  await expect(first.locator('[data-consumer-grid] tbody [data-field="person.name"]')).toHaveText("Off page");
  await first.locator('[data-row-action="inspect"]').click();
  assert.deepEqual(await page.evaluate(() => {
    const screen = window.packedConsumer.screens.a;
    return { action: screen.gridEvents.at(-1), active: screen.grid.selected() };
  }), { action: { kind: "action", action: "inspect", id: secondId, name: "Off page",
    element: "inspect", current: true, type: "click" }, active: firstId });
  const gridAfter = await page.evaluate(() => {
    const state = window.packedConsumer;
    const screen = state.screens.a;
    const other = state.screens.b;
    screen.grid.setSort(null);
    screen.grid.setColumnFilter("choice", null);
    screen.grid.setPage({ page: 1, size: 1 });
    screen.grid.select(null);
    screen.grid.setSelected([]);
    screen.grid.setChecked([]);
    screen.gridEvents.length = 0;
    const probe = state.gridProbe;
    probe.unsubscribe.forEach(unsubscribe => unsubscribe());
    const result = {
      rows: Object.fromEntries(Object.entries(state.screens).map(([slot, entry]) =>
        [slot, { entries: entry.rows.entries(), changes: entry.rows.changes() }])),
      notifications: probe.notifications, sameRowFields: probe.sameRowFields,
      sameScreenNodes: probe.roots.every(root => root.isConnected) &&
        probe.form === document.querySelector('[data-host="a"] form') &&
        probe.input === document.querySelector('[data-host="a"] form input') &&
        probe.header === document.querySelector('[data-host="a"] [data-consumer-grid] thead th'),
      reset: { active: screen.grid.selected(), selected: screen.grid.selectedIds(), checked: screen.grid.checkedIds(),
        filter: screen.grid.columnFilter("choice"), page: screen.grid.page() },
      other: { active: other.grid.selected(), selected: other.grid.selectedIds(), checked: other.grid.checkedIds(),
        filter: other.grid.columnFilter("choice"), page: other.grid.page(), events: other.gridEvents }
    };
    delete state.gridProbe;
    return result;
  });
  assert.deepEqual(gridAfter.rows, gridBefore, "Selection, checks, filters, sorting and actions must preserve Rows values and changes.");
  assert.deepEqual(gridAfter.notifications, { a: 0, b: 0 }, "Grid view state must not notify Rows subscribers.");
  assert(gridAfter.sameRowFields && gridAfter.sameScreenNodes, "Grid controls must preserve field and mounted screen nodes.");
  const resetGrid = { active: null, selected: [], checked: [], filter: null,
    page: { page: 1, size: 1, total: 2, pages: 2 } };
  assert.deepEqual(gridAfter.reset, resetGrid);
  assert.deepEqual(gridAfter.other, { ...resetGrid, events: [] }, "Grid view state must remain isolated between screens.");
  await expect(first.locator('[data-consumer-grid] tbody [data-field="person.name"]')).toHaveText("Ada");

  const columnsBefore = await page.evaluate(() => {
    const state = window.packedConsumer;
    const notifications = { a: 0, b: 0 };
    state.columnProbe = {
      notifications,
      unsubscribe: Object.entries(state.screens).map(([slot, screen]) =>
        screen.rows.subscribe(() => notifications[slot]++)),
      person: document.querySelector('[data-host="a"] [data-consumer-grid] tbody [data-field="person.name"]'),
      choice: document.querySelector('[data-host="a"] [data-consumer-grid] select')
    };
    return Object.fromEntries(Object.entries(state.screens).map(([slot, screen]) =>
      [slot, { entries: screen.rows.entries(), changes: screen.rows.changes() }]));
  });
  const columnKeys = () => first.locator("[data-consumer-grid] thead tr").evaluate(row =>
    [...row.cells].map(cell => cell.dataset.column));
  const rowColumnKeys = () => first.locator("[data-consumer-grid] tbody tr").evaluate(row =>
    [...row.cells].map(cell => cell.dataset.column));
  await page.evaluate(() => {
    const grid = window.packedConsumer.screens.a.grid;
    grid.setColumns([...grid.columns()].reverse());
  });
  assert.deepEqual(await columnKeys(), ["choice", "person"], "Flat authored headers must follow column order.");
  assert.deepEqual(await rowColumnKeys(), ["choice", "person"], "Rendered row cells must follow column order.");
  await page.evaluate(() => {
    const grid = window.packedConsumer.screens.a.grid;
    grid.setColumns(grid.columns().map(column => ({ ...column, hidden: column.key === "choice" })));
  });
  assert.deepEqual(await columnKeys(), ["person"]);
  assert.deepEqual(await rowColumnKeys(), ["person"]);
  await expect(first.locator('[data-consumer-grid] [data-column="choice"]')).toHaveCount(0);
  await page.evaluate(() => {
    const grid = window.packedConsumer.screens.a.grid;
    grid.setColumns(grid.columns().map(column => ({ ...column, hidden: false })));
  });
  assert.deepEqual(await columnKeys(), ["choice", "person"]);
  assert.deepEqual(await rowColumnKeys(), ["choice", "person"]);
  await expect(first.locator("select")).toHaveValue("11");
  const resize = first.getByRole("button", { name: "Resize Person column" });
  await resize.focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.evaluate(() => window.packedConsumer.screens.a.grid.columns()
    .find(column => column.key === "person").width), 190, "Authored resize control must change the preferred width.");
  await page.keyboard.press("Home");
  const columnsAfter = await page.evaluate(() => {
    const state = window.packedConsumer;
    const probe = state.columnProbe;
    probe.unsubscribe.forEach(unsubscribe => unsubscribe());
    const result = {
      rows: Object.fromEntries(Object.entries(state.screens).map(([slot, screen]) =>
        [slot, { entries: screen.rows.entries(), changes: screen.rows.changes() }])),
      notifications: probe.notifications,
      samePerson: probe.person === document.querySelector('[data-host="a"] [data-consumer-grid] tbody [data-field="person.name"]'),
      sameChoice: probe.choice === document.querySelector('[data-host="a"] [data-consumer-grid] select'),
      focused: document.activeElement === document.querySelector('[data-host="a"] [data-resize-column="person"]'),
      columns: state.screens.a.grid.columns(),
      events: state.screens.a.columnEvents,
      otherColumns: state.screens.b.grid.columns(),
      otherEvents: state.screens.b.columnEvents,
      otherHeaderKeys: [...document.querySelector('[data-host="b"] [data-consumer-grid] thead tr').cells]
        .map(cell => cell.dataset.column),
      otherRowKeys: [...document.querySelector('[data-host="b"] [data-consumer-grid] tbody tr').cells]
        .map(cell => cell.dataset.column)
    };
    delete state.columnProbe;
    return result;
  });
  assert.deepEqual(columnsAfter.rows, columnsBefore, "Column layout must preserve all Rows values and changes.");
  assert.deepEqual(columnsAfter.notifications, { a: 0, b: 0 }, "Column layout must not notify Rows subscribers.");
  assert(columnsAfter.samePerson && columnsAfter.sameChoice, "Column layout must preserve existing field nodes and bindings.");
  assert(columnsAfter.focused, "Keyboard resizing must preserve focus on the authored control.");
  assert.deepEqual(columnsAfter.columns,
    [{ key: "choice", width: 120, hidden: false }, { key: "person", width: 180, hidden: false }]);
  assert.deepEqual(columnsAfter.events, [
    { columns: [{ key: "choice", width: 120 }, { key: "person", width: 180 }], type: null },
    { columns: [{ key: "choice", width: 120, hidden: true }, { key: "person", width: 180, hidden: false }], type: null },
    { columns: [{ key: "choice", width: 120, hidden: false }, { key: "person", width: 180, hidden: false }], type: null },
    { columns: [{ key: "choice", width: 120, hidden: false }, { key: "person", width: 190, hidden: false }], type: "keydown" },
    { columns: [{ key: "choice", width: 120, hidden: false }, { key: "person", width: 180, hidden: false }], type: "keydown" }
  ], "Installed Grid must report each committed column state with its event source.");
  assert.deepEqual(columnsAfter.otherColumns, [{ key: "person", width: 180 }, { key: "choice", width: 120 }]);
  assert.deepEqual(columnsAfter.otherEvents, [], "Column changes must stay within their mounted screen.");
  assert.deepEqual(columnsAfter.otherHeaderKeys, ["person", "choice"], "Other screen headers must keep their authored order.");
  assert.deepEqual(columnsAfter.otherRowKeys, ["person", "choice"], "Other screen row cells must keep their authored order.");

  const pasteAccepted = await page.evaluate(() => {
    const state = window.packedConsumer;
    const screen = state.screens.a;
    const ids = screen.rows.entries().map(row => row.id);
    const other = state.screens.b.rows.entries();
    const events = [];
    const unsubscribe = screen.rows.subscribe(event => events.push(event));
    screen.grid.setColumns([...screen.grid.columns()].reverse());
    screen.grid.setPage(null);
    const result = screen.grid.paste("Pasted Ada\t22\nPasted Other\t11", { id: ids[0], field: "person.name" });
    const acceptedEntries = screen.rows.entries();
    const choice = document.querySelector('[data-host="a"] [data-consumer-grid] select');
    choice.focus();
    const rejected = screen.grid.paste("Must not commit\t11\nNeither may this\t999", {
      id: ids[0], field: "person.name"
    });
    const response = {
      valid: result.valid, rejected: rejected.valid,
      issues: rejected.issues.map(({ rowId, field, rule }) => ({ rowId, field, rule })),
      ids, entries: screen.rows.entries(), changes: screen.rows.changes(), events,
      immutableEvent: Object.isFrozen(events[0]) && Object.isFrozen(events[0].ids),
      unchangedAfterRejection: acceptedEntries === screen.rows.entries(),
      focusPreserved: document.activeElement === choice,
      otherUnchanged: other === state.screens.b.rows.entries(),
      callbacks: screen.pasteEvents
    };
    unsubscribe();
    return response;
  });
  assert.equal(pasteAccepted.valid, true, "Installed Grid must accept a complete typed two-row paste.");
  assert.equal(pasteAccepted.rejected, false, "An unavailable later Select value must reject the whole paste.");
  assert(pasteAccepted.issues.some(issue => issue.rowId === secondId && issue.field === "choice"));
  assert.deepEqual(pasteAccepted.entries.map(row => row.id), [firstId, secondId]);
  assert.deepEqual(pasteAccepted.entries.map(row => [row.value.person.name, row.value.choice]),
    [["Pasted Ada", 22], ["Pasted Other", 11]]);
  assert.deepEqual(pasteAccepted.changes.map(row => row.status), ["update", "update"]);
  assert.deepEqual(pasteAccepted.events, [{ type: "setMany", ids: [firstId, secondId], changed: true }],
    "A successful paste must publish one coherent store event, and rejection must not publish another.");
  assert(pasteAccepted.immutableEvent && pasteAccepted.unchangedAfterRejection &&
    pasteAccepted.focusPreserved && pasteAccepted.otherUnchanged,
  "Paste must preserve stable snapshots, focus and the independent CVC screen on rejection.");
  assert.deepEqual(pasteAccepted.callbacks.map(result => result.valid), [true, false]);
  await expect(first.locator("form input")).toHaveValue("Pasted Ada");
  await expect(first.locator("[data-tree-label]")).toHaveText(["Pasted Ada", "Pasted Other"]);
  assert.deepEqual(await first.locator('[data-consumer-grid] select').evaluateAll(elements =>
    elements.map(element => element.value)), ["22", "11"]);
  const nativePaste = await first.locator('[data-consumer-grid] select').first().evaluate(element => {
    element.focus();
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", "11");
    // Firefox discards DataTransfer passed to an untrusted ClipboardEvent constructor.
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: clipboardData });
    element.dispatchEvent(event);
    return { prevented: event.defaultPrevented, focused: document.activeElement === element };
  });
  assert.deepEqual(nativePaste, { prevented: true, focused: true });
  assert.equal(await page.evaluate(() => window.packedConsumer.screens.a.rows.entries()[0].value.choice), 11,
    "Native installed paste must preserve the Select's numeric raw value.");
  assert.deepEqual(await page.evaluate(() => window.packedConsumer.screens.a.pasteEvents.map(result => result.valid)),
    [true, false, true]);
  await expect(page.locator('[data-host="b"] form input')).toHaveValue("Bea");
  await page.evaluate(() => {
    const screen = window.packedConsumer.screens.a;
    screen.rows.revert();
    screen.grid.setPage({ page: 1, size: 1 });
    screen.pasteEvents.length = 0;
  });
  await expect(first.locator("form input")).toHaveValue("Ada");
  await expect(first.locator('[data-consumer-grid] tbody [data-field="person.name"]')).toHaveText("Ada");
  await expect(first.locator("form input")).toHaveAttribute("data-field-changed", "false");
  await expect(first.locator('[data-consumer-grid] tbody [data-field="person.name"]')).toHaveAttribute("data-field-changed", "false");

  await first.locator("form input").fill("Ann");
  await expect(first.locator("[data-consumer-grid] tbody [data-field='person.name']")).toHaveText("Ann");
  await expect(first.locator("form input")).toHaveAttribute("data-field-changed", "true");
  await expect(first.locator("[data-consumer-grid] tbody [data-field='person.name']")).toHaveAttribute("data-field-changed", "true");
  await expect(page.locator('[data-host="b"] form input')).toHaveValue("Bea");
  await expect(page.locator('[data-host="b"] form input')).toHaveAttribute("data-field-changed", "false");
  assert.deepEqual(await page.evaluate(() => Object.fromEntries(Object.entries(window.packedConsumer.screens)
    .map(([slot, screen]) => [slot, screen.rows.original(screen.rows.entries()[0].id).person.name]))), { a: "Ada", b: "Bea" },
  "Installed shared Form/Grid edits must preserve each CVC screen's loaded baseline.");
  await first.locator("select").selectOption("22");
  await expect(first.locator("select")).toHaveAttribute("data-field-changed", "true");
  assert.equal(await page.evaluate(() => window.packedConsumer.screens.a.rows.entries()[0].value.choice),
    22, "Nested row-local Select must keep its raw number value.");
  await first.locator('[data-action="save"]').click();
  assert.deepEqual(await page.evaluate(() => window.packedConsumer.outputs), ["a"]);

  await expect(first.locator('[role="treeitem"]')).toHaveCount(2);
  await first.locator('[role="treeitem"]').first().focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => window.packedConsumer.screens.a.tree.selected()),
    await page.evaluate(() => window.packedConsumer.screens.a.rows.entries()[1].id));
  assert.equal(await page.evaluate(() => window.packedConsumer.screens.b.tree.selected()), null);
  await first.locator('[data-date-value="2026-10-07"]').click();
  assert.equal(await page.evaluate(() => window.packedConsumer.screens.a.picker.value()), "2026-10-07");
  assert.equal(await page.evaluate(() => window.packedConsumer.screens.a.rows.entries()[0].value.date), "2026-10-07");
  assert.equal(await page.evaluate(() => window.packedConsumer.screens.b.picker.value()), "2026-10-05");

  await page.evaluate(() => {
    window.packedConsumer.screens.a.notifications.show("<b>Saved</b>");
    window.packedConsumer.screens.b.notifications.show("Other workspace");
  });
  await expect(first.locator("[data-notify-list] [data-notify-message]")).toHaveText("<b>Saved</b>");
  await expect(first.locator("[data-notify-message] b")).toHaveCount(0);
  await first.locator("[data-notify-close]").click();
  await expect(first.locator("[data-notify-list] li")).toHaveCount(0);
  await expect(page.locator('[data-host="b"] [data-notify-list] li')).toHaveCount(1);
  await page.evaluate(() => window.packedConsumer.screens.a.openDocument("Employee"));
  const documentInput = first.locator('[data-document-panels] input');
  await expect(documentInput).toHaveValue("Ann");
  const initialController = await first.locator("[data-document-controller]").getAttribute("data-document-controller");
  await page.evaluate(() => window.packedConsumer.screens.a.openDocument("Other"));
  await page.evaluate(() => window.packedConsumer.screens.a.openDocument("Employee"));
  assert.equal(await first.locator('[data-document-controller]').first().getAttribute("data-document-controller"), initialController);
  const guarded = await page.evaluate(() => window.packedConsumer.screens.a.documents.close("Employee"));
  assert.equal(guarded, false, "Application close policy must preserve the document.");
  await page.evaluate(() => window.packedConsumer.screens.a.documents.reload("Employee"));
  assert.notEqual(await first.locator('[role="tabpanel"]:not([hidden]) [data-document-controller]').getAttribute("data-document-controller"), initialController);
  await first.locator('[role="tabpanel"]:not([hidden]) input').fill("Anne");
  await expect(first.locator(':scope > article > form input')).toHaveValue("Anne");
  await page.evaluate(async () => {
    window.packedConsumer.allowClose = true;
    await window.packedConsumer.screens.a.documents.close("Employee");
  });
  assert.equal(await page.evaluate(() => window.packedConsumer.screens.a.documents.selected()), "Other");
  assert.deepEqual(await page.evaluate(() => window.packedConsumer.screens.b.documents.keys()), []);
  const finalIds = await page.evaluate(() => [...document.querySelectorAll("[id]")].map(item => item.id));
  assert.equal(new Set(finalIds).size, finalIds.length, "Dynamic document IDs must stay unique.");

  const disposed = await page.evaluate(async () => {
    const firstScreen = window.packedConsumer.screens.a;
    const handle = window.packedConsumer.handles.a;
    const removedRoot = handle.root;
    const oldButton = removedRoot.querySelector('[data-action="save"]');
    const outputCount = window.packedConsumer.outputs.length;
    await handle.dispose();
    oldButton.click();
    return {
      hostEmpty: !document.querySelector('[data-host="a"]').firstElementChild,
      pageRootGone: handle.root === null,
      ownedResourcesDisposed: firstScreen.disposed,
      noLateOutput: window.packedConsumer.outputs.length === outputCount,
      otherScreenPresent: !!document.querySelector('[data-host="b"] article')
    };
  });
  assert.deepEqual(disposed, {
    hostEmpty: true, pageRootGone: true, ownedResourcesDisposed: true,
    noLateOutput: true, otherScreenPresent: true
  });
  const reloaded = await page.evaluate(async () => {
    const state = window.packedConsumer;
    const oldScreen = state.screens.b;
    await state.handles.b.reload();
    return {
      oldDisposed: oldScreen.disposed,
      newInstance: state.screens.b !== oldScreen,
      rootCount: document.querySelectorAll('[data-host="b"] article').length
    };
  });
  assert.deepEqual(reloaded, { oldDisposed: true, newInstance: true, rootCount: 1 });
  await expect(page.locator('[data-host="b"] form input')).toHaveValue("Bea");
  await page.evaluate(async () => window.packedConsumer.handles.b.dispose());
  await expect(page.locator("article")).toHaveCount(0);
  assert.deepEqual(errors, [], `Browser errors: ${errors.join(" | ")}`);
  process.stdout.write(`Packed browser consumer passed (${browserName} ${browser.version()}, ${process.platform}, SHA-256 ${sha256}).\n`);
} finally {
  await Promise.allSettled([browser?.close(), vite?.close()]);
  removeOwnedTempRoot();
}

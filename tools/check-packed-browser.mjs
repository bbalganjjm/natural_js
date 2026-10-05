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

  await first.locator("form input").fill("Ann");
  await expect(first.locator("[data-consumer-grid] tbody [data-field='person.name']")).toHaveText("Ann");
  await expect(page.locator('[data-host="b"] form input')).toHaveValue("Bea");
  await first.locator("select").selectOption("22");
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

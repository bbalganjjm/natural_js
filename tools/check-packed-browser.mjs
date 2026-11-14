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

  const requests = await page.evaluate(() => window.packedConsumer.checkRequests());
  assert.deepEqual(requests, {
    result: [{ name: "Ada" }],
    order: ["beforeInit", "prepare", "after", "decode", "success", "complete", "beforeInit", "complete"],
    reads: 1, completed: 2, plain: true, stopped: true, abortName: "AbortError", abortComplete: 1,
    customValue: { employee: "A&B" },
    customStages: [["send", true, "https://example.test/employees"], ["after"], ["decode"]]
  }, "Installed requests must preserve captured plain hooks, explicit application stages and aborted completion.");

  const pageLoading = await page.evaluate(() => window.packedConsumer.checkPageLoading());
  assert.deepEqual(pageLoading, {
    reads: 1, loads: 2, plain: true, initial: { text: "Processed", inertIds: 2, liveIds: 0 }, reloaded: "Processed",
    controllers: 2, cleaned: 2, prepared: 3, processed: 3, decoded: 3,
    canceled: { outcome: "AbortError", signalAborted: true, controllers: 0, empty: true, after: 0, decode: 0 },
    rejected: { code: "PAGE_HTML", controllers: 0, empty: true, executed: false }
  }, "Installed pages must capture a plain communicator HTML loader, preserve inert IDs, cancel late work and reject nested executable templates.");

  const choiceGroups = await page.evaluate(() => {
    const h = window.packedConsumer.choiceGroups, id = h.rows.entries()[0].id;
    const initial = { gender: h.gender.value(), fruit: h.fruit.value(), empty: h.empty.value(), defaults: h.defaults,
      read: h.form.read(), valid: h.form.validate().valid };
    const before = h.root.outerHTML, errors = [];
    for (const action of [() => h.gender.setValue("male"), () => h.empty.dispose()]) {
      try { action(); } catch (cause) { errors.push(cause.code); }
    }
    const locked = errors.length === 2 && errors.every(code => code === "CHOICE_OWNED") && h.root.outerHTML === before;
    h.fruit.setChoices([]);
    const removed = { value: h.fruit.value(), read: h.form.read(), valid: h.form.validate().valid };
    h.fruit.setChoices([{ value: "apple", label: "Apple again" }, { value: "banana", label: "Banana again" }]);
    const returned = { value: h.fruit.value(), defaults: h.form.defaults(), valid: h.form.validate().valid };
    const male = h.root.querySelector('input[type="radio"][value="male"]');
    male.checked = true; male.dispatchEvent(new Event("change", { bubbles: true }));
    const edited = h.rows.get(id).value.gender;
    h.rows.revert(id); const reverted = h.gender.value();
    h.form.unbind(); const restored = { gender: h.gender.value(), fruit: h.fruit.value(), source: h.rows.get(id).value };
    h.form.dispose();
    h.fruit.setChoices([{ value: "apple", label: "Apple" }]); h.fruit.setValue(["apple"]);
    const one = h.fruit.value(); h.fruit.setChoices([]); const zero = h.fruit.value();
    h.empty.dispose(); h.fruit.dispose(); h.gender.dispose();
    const exact = h.root.outerHTML === h.original;
    h.rows.dispose(); h.root.remove(); delete window.packedConsumer.choiceGroups;
    return { initial, locked, removed, returned, edited, reverted, restored, one, zero, exact };
  });
  assert.deepEqual(choiceGroups, {
    initial: { gender: "female", fruit: ["banana"], empty: [], defaults: { gender: "male", fruits: ["apple"], empty: [] },
      read: { gender: "female", fruits: ["banana"], empty: [] }, valid: true },
    locked: true,
    removed: { value: [], read: { gender: "female", fruits: ["banana"], empty: [] }, valid: false },
    returned: { value: ["banana"], defaults: { gender: "male", fruits: ["apple"], empty: [] }, valid: true },
    edited: "male", reverted: "female",
    restored: { gender: "male", fruit: ["apple"], source: { gender: "female", fruits: ["banana"], empty: [] } },
    one: ["apple"], zero: [], exact: true
  }, "Installed authored groups must mediate live catalogs while keeping raw data, captured defaults, direct-write locks and exact teardown.");

  const incoming = await page.evaluate(() => {
    const rows = window.packedConsumer.incoming;
    rows.replaceState([
      { value: { employeeNo: "A", name: "Received removal" }, status: "delete" },
      { value: { employeeNo: "B", name: "Received revision" }, status: "update" }
    ]);
    const [deleted, updated] = rows.entries({ includeDeleted: true });
    const [inserted] = rows.appendState([{ value: { employeeNo: "C", name: "Pending" }, status: "insert" }]);
    rows.set(updated.id, "name", "Local revision"); rows.remove(updated.id);
    const payload = rows.changes().map(change => {
      const value = change.status === "delete" ? rows.get(change.id).value : change.value;
      return { employeeNo: value.employeeNo, name: value.name, rowStatus: change.status };
    });
    rows.move(inserted, deleted.id); rows.set(inserted, "name", "Local pending");
    const ordinaryCopy = rows.copy(inserted); rows.revert();
    const result = { payload, restored: rows.entries({ includeDeleted: true }).map(row => [row.value.name, row.status]),
      insertedOriginal: rows.original(inserted) ?? null, ordinaryCopyRemoved: rows.get(ordinaryCopy) === undefined };
    rows.dispose(); delete window.packedConsumer.incoming;
    return result;
  });
  assert.deepEqual(incoming, { payload: [
    { employeeNo: "A", name: "Received removal", rowStatus: "delete" },
    { employeeNo: "B", name: "Local revision", rowStatus: "delete" },
    { employeeNo: "C", name: "Pending", rowStatus: "insert" }
  ], restored: [["Pending", "insert"], ["Received removal", "delete"], ["Received revision", "update"]], insertedOriginal: null, ordinaryCopyRemoved: true });

  const localForm = await page.evaluate(async () => {
    const h = window.packedConsumer.localForm, input = h.root.querySelector("input");
    const initial = { shown: input.value, raw: h.form.read().amount, valid: h.form.validate().valid };
    input.value = "2100";
    const direct = h.form.read().amount; h.form.bind(null);
    const refreshed = input.value;
    input.focus(); const focused = input.value;
    input.value = "3100"; input.dispatchEvent(new Event("input", { bubbles: true })); input.blur();
    const edited = { shown: input.value, raw: h.form.read().amount, valid: h.form.validate().valid };
    h.owner.reset();
    const reset = { shown: input.value, raw: h.form.read().amount, valid: h.form.validate().valid };
    input.value = "bad"; input.dispatchEvent(new Event("input", { bubbles: true }));
    const invalid = !h.form.validate().valid; await Promise.resolve();
    const preserved = input.value === "bad" && input.getAttribute("aria-invalid") === "true" && h.form.read().amount === "bad";
    h.owner.reset(); h.form.read();
    const before = h.root.innerHTML;
    h.owner.addEventListener("reset", event => event.preventDefault(), { once: true });
    h.owner.reset(); await Promise.resolve();
    const canceled = h.root.innerHTML === before && input.value === "1,200" && h.form.read().amount === "1200";
    const summary = h.root.querySelector("span").textContent;
    h.form.dispose();
    const disposed = input.value === "1200" && h.root.querySelector("span").firstChild === h.originalSummary;
    h.owner.reset(); await Promise.resolve();
    const quiet = input.value === "1200" && h.root.querySelector("span").firstChild === h.originalSummary;
    h.container.remove(); delete window.packedConsumer.localForm;
    return { initial, direct, refreshed, focused, edited, reset, invalid, preserved, canceled, summary, disposed, quiet };
  });
  assert.deepEqual(localForm, { initial: { shown: "1,200", raw: "1200", valid: true }, direct: "2100",
    refreshed: "2,100", focused: "2100", edited: { shown: "3,100", raw: "3100", valid: true },
    reset: { shown: "1200", raw: "1200", valid: true }, invalid: true, preserved: true, canceled: true,
    summary: "Original:1200:Base", disposed: true, quiet: true },
  "Installed local Form must preserve raw input while formatting, validating and reconciling its ancestor native reset.");

  const formValues = await page.evaluate(() => {
    const h = window.packedConsumer.formValues, id = h.rows.entries()[0].id;
    const input = h.root.querySelector('[data-field="name"]');
    const summary = h.root.querySelector('[data-field="summary"]');
    const initial = { text: summary.textContent, input: input.value,
      checked: h.root.querySelector('[data-field="active"]').checked,
      selected: h.root.querySelector('select').selectedOptions[0].textContent, raw: h.form.read() };
    const count = h.calls.length;
    const issues = h.form.validate().issues.map(issue => issue.field).sort();
    const quietValidation = h.calls.length === count;
    const observed = h.calls.find(call => call[0] === "after" && call[1] === "summary");
    h.rows.set(id, "name", "Ada");
    const val = h.calls.filter(call => call[1] === "name").map(call => call.slice(0, 4));
    const beforeFocus = h.calls.length;
    input.focus(); const focused = input.value; input.blur();
    const unfocused = input.value;
    const quietFocus = h.calls.length === beforeFocus;
    const source = { original: h.rows.original(id).name, value: h.rows.get(id).value.name,
      changes: h.rows.changes().map(change => change.status) };
    h.form.dispose(); const stopped = h.calls.length;
    h.rows.set(id, "summary", "late");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const quietDispose = h.calls.length === stopped && summary.textContent === initial.text;
    h.rows.dispose(); h.root.remove(); delete window.packedConsumer.formValues;
    return { initial, issues, quietValidation, observed, val, focused, unfocused, quietFocus, source, quietDispose };
  });
  assert.deepEqual(formValues, {
    initial: { text: "ADA!", input: "display:ab", checked: true, selected: "Two",
      raw: { summary: "ada", name: "ab", active: false, choice: 1 } },
    issues: ["active", "name"], quietValidation: true,
    observed: ["after", "summary", "bind", "ADA", "ADA"],
    val: [["before", "name", "bind", "ab"], ["after", "name", "bind", "display:ab"],
      ["before", "name", "val", "Ada"], ["after", "name", "val", "display:Ada"]],
    focused: "Ada", unfocused: "display:Ada", quietFocus: true,
    source: { original: "ab", value: "Ada", changes: ["update"] }, quietDispose: true
  }, "Installed Form callbacks must project views while preserving raw validation, changes and owned lifetime.");

  const formDefaults = await page.evaluate(async () => {
    const h = window.packedConsumer.formDefaults, amount = h.local.querySelector('[data-field="amount"]');
    const attachment = h.local.querySelector('[type="file"]'), summary = h.local.querySelector("span");
    const initial = h.form.defaults(); initial.amount = 99;
    const detached = h.form.defaults();
    h.local.reset(); const resetRaw = h.form.read();
    const native = { amount: resetRaw.amount, attachment: resetRaw.attachment };
    const before = h.renders.length; h.form.unbind();
    const raw = h.form.read();
    const restored = { shown: amount.value, amount: raw.amount, attachment: raw.attachment, summary: raw.summary,
      node: summary.firstChild === h.capturedSummary, quiet: h.renders.length === before,
      payload: await attachment.files[0].text(), modified: attachment.files[0].lastModified };
    amount.value = "2300"; amount.dispatchEvent(new Event("input", { bubbles: true }));
    const inactive = { shown: amount.value, raw: h.form.read().amount, quiet: h.renders.length === before };
    h.form.refresh(["summary"]); const selectedText = summary.textContent, selectedCalls = h.renders.length;
    amount.value = "2400"; amount.dispatchEvent(new Event("input", { bubbles: true }));
    const selected = { text: selectedText, shown: amount.value, quiet: h.renders.length === selectedCalls };
    h.form.refresh(); const resumed = amount.value;
    amount.value = "3400"; amount.dispatchEvent(new Event("input", { bubbles: true }));
    const automatic = amount.value;
    h.form.unbind(); const repeated = { raw: h.form.read().amount, file: attachment.files[0].name };
    const id = h.rows.entries()[0].id, name = h.rowRoot.querySelector("input");
    name.value = "Committed"; name.dispatchEvent(new Event("input", { bubbles: true }));
    name.value = ""; name.dispatchEvent(new Event("input", { bubbles: true }));
    const invalid = !h.rowForm.validate().valid, source = h.rows.entries();
    let notifications = 0; const stop = h.rows.subscribe(() => notifications++);
    h.rowForm.unbind();
    const rowView = { name: name.value, raw: h.rowForm.read(), node: h.rowRoot.querySelector("em") === h.capturedNote,
      changed: name.getAttribute("data-field-changed"), cleared: name.getAttribute("aria-invalid") !== "true" && h.rowRoot.querySelector("output").textContent === "" };
    h.rowForm.bind(id);
    const row = { value: h.rows.get(id).value.name, original: h.rows.original(id).name, status: h.rows.get(id).status,
      visible: name.value, unchanged: h.rows.entries() === source, notifications, binds: h.bindings.length,
      defaults: h.rowForm.defaults() };
    stop(); h.rowForm.dispose(); h.form.dispose();
    const codes = [];
    for (const action of [() => h.form.defaults(), () => h.rowForm.unbind()]) {
      try { action(); } catch (cause) { codes.push(cause.code); }
    }
    h.rows.dispose(); h.root.remove(); delete window.packedConsumer.formDefaults;
    return { detached, native, restored, inactive, selected, resumed, automatic, repeated, invalid, rowView, row, codes };
  });
  assert.deepEqual(formDefaults, {
    detached: { amount: 1200, attachment: "captured.txt" }, native: { amount: "1000", attachment: "" },
    restored: { shown: "1200", amount: "1200", attachment: "captured.txt", summary: "Authored summary", node: true,
      quiet: true, payload: "Captured payload", modified: 1 },
    inactive: { shown: "2300", raw: "2300", quiet: true },
    selected: { text: "Authored summary:2300", shown: "2400", quiet: true }, resumed: "2,400", automatic: "3,400",
    repeated: { raw: "1200", file: "captured.txt" }, invalid: true,
    rowView: { name: "Initial field", raw: { name: undefined, note: undefined }, node: true, changed: "false", cleared: true },
    row: { value: "Committed", original: "Loaded", status: "update", visible: "Committed", unchanged: true,
      notifications: 0, binds: 2, defaults: { name: "Initial field" } }, codes: ["FORM_DISPOSED", "FORM_DISPOSED"]
  }, "Installed Form defaults/unbind must restore captured UI/files and preserve Rows and explicit inactive/resume ownership.");

  const formDiscovery = await page.evaluate(async () => {
    const h = window.packedConsumer.formDiscovery;
    const code = document.createElement("label");
    code.innerHTML = 'Code <input data-field="profile.code" value="ab" data-format=\'[["upper"]]\'>';
    h.local.append(code);
    h.form.rescan();
    const input = code.querySelector("input");
    const adopted = { shown: input.value, raw: h.form.read().profile.code, defaults: h.form.defaults().profile.code };
    h.form.refresh(["profile.code"]);
    const projected = input.value;
    const fileLabel = document.createElement("label"), file = document.createElement("input");
    file.type = "file"; file.dataset.field = "attachment"; fileLabel.append("Attachment", file);
    const transfer = new DataTransfer(); transfer.items.add(new File(["adopted"], "late.txt")); file.files = transfer.files;
    h.local.append(fileLabel); h.form.rescan();
    file.value = ""; input.value = "edited";
    h.form.unbind();
    const restored = { code: input.value, file: file.files[0].name, content: await file.files[0].text() };
    const extra = document.createElement("input"); extra.dataset.field = "extra"; extra.dataset.format = '[["upper"]]'; extra.value = "xy";
    h.local.append(extra); h.form.rescan();
    extra.value = "pq"; extra.dispatchEvent(new Event("input", { bubbles: true }));
    const inactive = extra.value === "pq";
    h.form.refresh(["extra"]); const subset = extra.value;
    extra.value = "rs"; extra.dispatchEvent(new Event("input", { bubbles: true }));
    const subsetInactive = extra.value === "rs";
    h.form.refresh(); extra.focus(); const focused = extra.value; extra.blur();
    const resumed = extra.value;
    fileLabel.remove(); h.form.rescan(); file.value = ""; h.form.unbind();
    const retired = !Object.hasOwn(h.form.defaults(), "attachment") && file.files.length === 0;

    const [row] = h.rows.entries(), original = h.rows.get(row.id), calls = h.calls.length;
    const fields = document.createElement("div");
    fields.innerHTML = '<label>Code <input data-field="profile.code" value="Authored code"></label><label>Choice <select data-field="choice" data-options="options" data-option-label="label" data-option-value="code"><option value="">Choose</option></select></label>';
    h.rowRoot.append(fields); h.rowForm.rescan();
    const rowCode = fields.querySelector("input"), select = fields.querySelector("select");
    const quiet = rowCode.value === "Authored code" && select.options.length === 1 && h.calls.length === calls && h.rows.get(row.id) === original;
    h.rowForm.refresh(["profile.code", "choice"]);
    const rowProjected = { code: rowCode.value, choice: select.value, calls: h.calls.length };
    const name = h.rowRoot.querySelector('[data-field="name"]'), nameLabel = name.closest("label");
    name.value = ""; name.dispatchEvent(new Event("input", { bubbles: true }));
    h.rowForm.rescan();
    const retainedDraft = name.value === "" && name.getAttribute("aria-invalid") === "true";
    nameLabel.remove(); let rejected;
    try { h.rowForm.rescan(); } catch (error) { rejected = error.code; }
    h.rowRoot.prepend(nameLabel); h.rowForm.rescan();
    const retry = name.value === "" && h.rows.get(row.id) === original;
    h.rowForm.unbind(); h.rowForm.bind(row.id);
    const rowRestored = { name: name.value, code: rowCode.value, choice: select.value,
      original: h.rows.original(row.id).name, changes: h.rows.changes().length };
    h.form.dispose(); h.rowForm.dispose();
    const disposed = [];
    for (const form of [h.form, h.rowForm]) try { form.rescan(); } catch (error) { disposed.push(error.code); }
    h.rows.dispose(); h.root.remove(); delete window.packedConsumer.formDiscovery;
    return { adopted, projected, restored, inactive, subset, subsetInactive, focused, resumed, retired,
      quiet, rowProjected, retainedDraft, rejected, retry, rowRestored, disposed };
  });
  assert.deepEqual(formDiscovery, {
    adopted: { shown: "ab", raw: "ab", defaults: "ab" }, projected: "AB",
    restored: { code: "ab", file: "late.txt", content: "adopted" }, inactive: true, subset: "PQ", subsetInactive: true,
    focused: "rs", resumed: "RS", retired: true, quiet: true,
    rowProjected: { code: "Stored code", choice: "1", calls: 2 }, retainedDraft: true, rejected: "FORM_RESCAN", retry: true,
    rowRestored: { name: "Loaded name", code: "Stored code", choice: "1", original: "Loaded name", changes: 0 },
    disposed: ["FORM_DISPOSED", "FORM_DISPOSED"]
  }, "Installed Form rescan must reconcile late fields/files without projection, draft loss, source writes or implicit resume.");

  const formPresets = await page.evaluate(() => {
    const h = window.packedConsumer.formPresets, roots = [...h.root.querySelectorAll("form")];
    const inputs = roots.map(root => root.querySelector('[data-field="name"]'));
    const ids = h.rows.map(rows => rows.entries()[0].id);
    const initial = { shown: inputs.map(input => input.value), raw: h.rows.map((rows, index) => rows.get(ids[index]).value.name),
      checked: roots.map(root => root.querySelector('[type="checkbox"]').checked) };
    const captured = h.calls.every(call => call.plain && Object.isFrozen(call.context)) &&
      h.calls.every((call, index) => index % 2 === 0 ? call.handler === "local" && call.context === h.calls[index + 1].context : call.handler === "shared");
    for (const input of inputs) { input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true })); }
    const policy = { raw: h.rows.map((rows, index) => rows.get(ids[index]).value.name),
      invalid: inputs.map(input => input.getAttribute("aria-invalid")), explicitThird: h.forms[2].validate().valid };
    h.forms[0].unbind(); h.forms[0].bind(ids[0]); h.rows[0].set(ids[0], "name", " next ");
    const updated = { shown: inputs[0].value, raw: h.rows[0].get(ids[0]).value.name, original: h.rows[0].original(ids[0]).name,
      native: h.forms[0].defaults().name, other: h.rows[1].get(ids[1]).value.name,
      phases: [...new Set(h.calls.map(call => call.context.phase))].sort(), frozen: Object.isFrozen(h.shared), sharedPolicy: h.shared.autoValidate };
    for (const form of h.forms) form.dispose(); for (const rows of h.rows) rows.dispose();
    h.root.remove(); delete window.packedConsumer.formPresets;
    return { initial, captured, policy, updated };
  });
  assert.deepEqual(formPresets, {
    initial: { shown: ["ADA", " bea ", "CY"], raw: [" ada ", " bea ", " cy "], checked: [true, true, true] }, captured: true,
    policy: { raw: [" ada ", " bea ", ""], invalid: ["true", "true", null], explicitThird: false },
    updated: { shown: "NEXT", raw: " next ", original: " ada ", native: "Captured", other: " bea ", phases: ["bind", "val"], frozen: true, sharedPolicy: false }
  }, "Installed explicit Form presets must preserve spread precedence, callback contexts, raw ownership and separate instance data.");

  const collectionValues = await page.evaluate(() => {
    const h = window.packedConsumer.collectionValues, id = h.rows.entries()[0].id;
    const shown = () => h.roots.map(root => ({ name: root.querySelector('[data-field="name"]').textContent,
      active: root.querySelector('[data-field="active"]').textContent,
      choice: root.querySelector("select").selectedOptions[0]?.textContent }));
    const initial = shown(), source = h.rows.get(id), original = h.rows.original(id);
    const paired = h.calls.every((call, index, calls) => call.plain && Object.isFrozen(call.context) &&
      (index % 2 === 0 ? call.callback === "before" && calls[index + 1]?.context === call.context : call.callback === "after"));
    h.policy.prefix = "Employee "; h.policy.choice = 2;
    const beforeRefresh = shown(); h.calls.length = 0;
    for (const handle of h.handles) handle.refresh();
    const refreshed = shown(), refreshPhases = [...new Set(h.calls.map(call => call.context.phase))];
    const quietSource = h.rows.get(id) === source && h.rows.original(id) === original && h.rows.changes().length === 0;
    h.calls.length = 0; h.rows.set(id, "name", " Bea ");
    const committed = shown(), updatePhases = [...new Set(h.calls.map(call => call.context.phase))];
    h.rows.set(id, "chosen", 99);
    const projectedChoice = shown().map(value => value.choice), count = h.calls.length;
    const validations = h.handles.map(handle => handle.validate());
    const validation = { valid: validations.map(result => result.valid),
      choiceIssues: validations.every(result => result.issues.some(issue => issue.field === "chosen")),
      quiet: h.calls.length === count, raw: h.rows.get(id).value.chosen };
    const raw = { current: h.rows.get(id).value.name, original: h.rows.original(id).name,
      active: h.rows.get(id).value.active, listDisabled: h.roots[2].querySelector("select").disabled };
    for (const handle of h.handles) handle.dispose();
    h.rows.dispose(); h.root.remove(); delete window.packedConsumer.collectionValues;
    return { initial, paired, beforeRefresh, refreshed, refreshPhases, quietSource, committed, updatePhases, projectedChoice, validation, raw };
  });
  const initialValue = { name: "ADA", active: "Active", choice: "One" };
  const refreshedValue = { name: "EMPLOYEE ADA", active: "Active", choice: "Two" };
  assert.deepEqual(collectionValues, {
    initial: [initialValue, initialValue, initialValue], paired: true,
    beforeRefresh: [initialValue, initialValue, initialValue],
    refreshed: [refreshedValue, refreshedValue, refreshedValue], refreshPhases: ["bind"], quietSource: true,
    committed: [0, 1, 2].map(() => ({ ...refreshedValue, name: "EMPLOYEE BEA" })), updatePhases: ["val"],
    projectedChoice: ["Two", "Two", "Two"], validation: { valid: [false, false, false], choiceIssues: true, quiet: true, raw: 99 },
    raw: { current: " Bea ", original: " Ada ", active: true, listDisabled: true }
  }, "Installed Form/Grid/List callbacks must share typed policy, preserve raw validation and refresh without source writes.");
  const formBinding = await page.evaluate(() => {
    const h = window.packedConsumer.formBinding, [first, second] = h.rows.entries();
    const input = h.root.querySelector("input"), summary = h.root.querySelector("span"), select = h.root.querySelector("select");
    const constructed = h.calls.length === 0;
    h.form.bind(first.id);
    const initial = [...h.calls];
    const sourceInitial = { keys: h.source.whole[0].entries.map(([key]) => key),
      hidden: Object.fromEntries(h.source.whole[0].entries).hidden,
      frozen: Object.isFrozen(first.value.hidden.details[0]),
      compiledOnly: !Object.hasOwn(h.form.read(), "hidden") && !Object.hasOwn(h.form.read(), "options") };
    input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true }));
    const invalid = !h.form.validate().valid, option = select.firstChild;
    summary.textContent = "Changed display";
    h.form.refresh(["summary", "summary"]);
    const partial = { display: summary.textContent, raw: h.form.read().name, entered: input.value, invalid: input.getAttribute("aria-invalid"),
      option: select.firstChild === option, calls: h.calls.length };
    let rejected = false;
    summary.textContent = "Preserved";
    try { h.form.refresh(["summary", "unknown"]); } catch (cause) { rejected = cause.code === "FORM_BIND"; }
    const preflight = rejected && summary.textContent === "Preserved";
    input.value = "Anne"; input.dispatchEvent(new Event("input", { bubbles: true }));
    const commitsSilent = h.calls.length === 2;
    h.rows.revert(first.id);
    const revert = h.calls.slice(2);
    h.form.refresh();
    const refreshed = h.calls.slice(4);
    h.form.bind(second.id);
    input.value = "Beth"; input.dispatchEvent(new Event("input", { bubbles: true }));
    const identity = h.rows.get(first.id).value.name === "Ada" && h.rows.get(second.id).value.name === "Beth";
    const nativeObserved = h.source.committed.some(({ event, rows }) => event.type === "set" &&
      rows.some(row => row.id === second.id && row.value.name === "Beth"));
    const wholeCount = h.calls.length, committedCount = h.source.committed.length;
    h.rows.set(second.id, "hidden", { ...h.rows.get(second.id).value.hidden, amount: 22.5 });
    h.rows.setMany([{ id: second.id, values: { name: "Batch Beth", hidden: {
      ...h.rows.get(second.id).value.hidden, details: [{ count: 5 }]
    } } }]);
    const sourceUpdates = h.source.committed.slice(committedCount).map(({ event, rows }) => {
      const row = rows.find(row => row.id === second.id);
      return { type: event.type, name: row.value.name, hidden: row.value.hidden };
    });
    const equalCount = h.source.committed.length;
    h.rows.set(second.id, "hidden", h.rows.get(second.id).value.hidden);
    const source = { initial: sourceInitial, nativeObserved, updates: sourceUpdates,
      wholeStages: h.source.whole.map(record => record.stage), wholeQuiet: h.calls.length === wholeCount,
      completeWhole: h.source.whole.every(({ entries }) => {
        const value = Object.fromEntries(entries);
        return entries.map(([key]) => key).join(",") === "name,summary,choice,options,hidden" &&
          value.options.length === 1 && typeof value.hidden.amount === "number" &&
          typeof value.hidden.enabled === "boolean" && typeof value.hidden.details[0].count === "number";
      }),
      equalQuiet: h.source.committed.length === equalCount,
      original: h.rows.original(second.id).hidden,
      receivedUnchanged: JSON.stringify(h.source.received) === h.source.receivedText };
    h.source.stop();
    h.form.dispose(); const stopped = h.calls.length;
    h.rows.revert();
    source.stopped = h.source.committed.length === equalCount;
    let disposed = false;
    try { h.form.refresh([]); } catch (cause) { disposed = cause.code === "FORM_DISPOSED"; }
    const quiet = stopped === h.calls.length;
    h.rows.dispose(); h.root.remove(); delete window.packedConsumer.formBinding;
    return { constructed, initial, invalid, partial, preflight, commitsSilent, revert, refreshed, identity, disposed, quiet,
      ids: [first.id, second.id], source };
  });
  const firstBindingId = formBinding.ids[0];
  assert.deepEqual(formBinding, { constructed: true,
    initial: [["before", firstBindingId, null, "A", true], ["after", firstBindingId, null, "Ada"]],
    invalid: true, partial: { display: "First", raw: "Ada", entered: "", invalid: "true", option: true, calls: 2 },
    preflight: true, commitsSilent: true,
    revert: [["before", firstBindingId, "revert", "A", true], ["after", firstBindingId, "revert", "Ada"]],
    refreshed: [["before", firstBindingId, null, "A", true], ["after", firstBindingId, null, "Ada"]],
    identity: true, disposed: true, quiet: true, ids: formBinding.ids,
    source: { initial: { keys: ["name", "summary", "choice", "options", "hidden"],
      hidden: { code: "A", amount: 12.5, enabled: true, details: [{ count: 2 }] }, frozen: true, compiledOnly: true },
      nativeObserved: true,
      updates: [{ type: "set", name: "Beth", hidden: { code: "B", amount: 22.5, enabled: false, details: [{ count: 3 }] } },
        { type: "setMany", name: "Batch Beth", hidden: { code: "B", amount: 22.5, enabled: false, details: [{ count: 5 }] } }],
      wholeStages: ["before", "after", "before", "after", "before", "after", "before", "after"],
      wholeQuiet: true, completeWhole: true, equalQuiet: true, original: { code: "B", amount: 21.5, enabled: false, details: [{ count: 3 }] },
      receivedUnchanged: true, stopped: true } },
  "Installed Form whole hooks and same-row refresh must preserve immutable raw context, drafts, errors, choices and lifetime.");

  const formChoices = await page.evaluate(() => {
    const h = window.packedConsumer.sharedRules, id = h.rows.entries()[0].id;
    const single = h.root.querySelector('form [data-field="assignment.chosen"]');
    const multiple = h.root.querySelector('form [data-field="assignment.selected"]');
    const initial = { chosen: single.selectedOptions[0].textContent,
      selected: [...multiple.selectedOptions].map(option => option.textContent) };
    single.selectedIndex = [...single.options].findIndex(option => option.textContent === "Text one");
    single.dispatchEvent(new Event("change", { bubbles: true }));
    const chosen = h.rows.get(id).value.assignment.chosen;
    for (const option of multiple.options) option.selected = option.textContent === "Number one" || option.textContent === "Off";
    multiple.dispatchEvent(new Event("change", { bubbles: true }));
    const selected = h.rows.get(id).value.assignment.selected;
    const assignment = h.rows.get(id).value.assignment;
    const other = h.rows.add({ profile: { name: "Other" }, salary: 150,
      assignment: { ...assignment, choices: [{ meta: { label: "Other only" }, code: 99 }], chosen: "1" } });
    const before = [...single.options];
    const hidden = h.form.validate(other);
    const hiddenSafe = hidden.issues.some(issue => issue.field === "assignment.chosen" && issue.rule === "select-option" && !issue.element) &&
      before.every((option, index) => single.options[index] === option);
    h.rows.remove(other);
    h.rows.set(id, "assignment", { ...h.rows.get(id).value.assignment, selected: [1, 1] });
    const duplicateRejected = h.form.validate(id).issues.some(issue => issue.field === "assignment.selected" && issue.rule === "select-option");
    h.rows.revert();
    return { initial, chosen, selected, hiddenSafe, duplicateRejected, restored: h.form.read().assignment };
  });
  assert.deepEqual(formChoices.initial, { chosen: "Off", selected: ["Number one", "Text one"] });
  assert.equal(formChoices.chosen, "1");
  assert.deepEqual(formChoices.selected, [1, false]);
  assert(formChoices.hiddenSafe && formChoices.duplicateRejected,
    "Installed Form choices must use target-row availability and preserve raw occurrence counts.");
  assert.equal(formChoices.restored.chosen, false);
  assert.deepEqual(formChoices.restored.selected, [1, "1"]);

  const sharedRules = await page.evaluate(() => {
    const h = window.packedConsumer.sharedRules, id = h.rows.entries()[0].id;
    const fields = [...h.root.querySelectorAll('[data-field="profile.name"]')];
    const formatted = fields.map(element => element instanceof HTMLInputElement ? element.value : element.textContent);
    const salary = h.root.querySelector('form [data-field="salary"]');
    salary.value = "50"; salary.dispatchEvent(new Event("input", { bubbles: true }));
    const raw = h.rows.get(id).value.salary;
    const validation = [h.form, h.grid, h.list].map(owner => owner.validate(id).issues.map(issue => issue.rule));
    const rejected = h.grid.paste("25", { id, field: "salary" });
    salary.value = "bad"; salary.dispatchEvent(new Event("input", { bubbles: true }));
    const parse = h.form.validate(id).issues.some(issue => issue.rule === "parse");
    const preserved = h.rows.get(id).value.salary === raw;
    h.list.dispose(); h.grid.dispose(); h.form.dispose();
    const restored = h.root.outerHTML === h.original;
    salary.value = "Late"; salary.dispatchEvent(new Event("input", { bubbles: true }));
    h.rows.set(id, "salary", 200);
    const quiet = h.root.outerHTML === h.original;
    h.rows.dispose(); h.root.remove(); delete window.packedConsumer.sharedRules;
    return { formatted, raw, validation, rejected: !rejected.valid, parse, preserved, restored, quiet };
  });
  assert.deepEqual(sharedRules, { formatted: ["ADA", "ADA", "ADA"], raw: 50,
    validation: [["minvalue"], ["minvalue"], ["minvalue"]], rejected: true, parse: true,
    preserved: true, restored: true, quiet: true });

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
      cleanFields, insertedFields, dirtyFields, deletedFields, undoFields, appendedOriginals, plain: h.plain };
  });
  assert(lifecycle.plain, "Installed Grid must invoke captured binding callbacks without an implicit receiver.");
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

  const progressive = await page.evaluate(async () => {
    const state = window.packedConsumer, h = state.progressive;
    const first = await h.grid.whenBound();
    const initial = { ...first, event: first.event?.type ?? null, active: h.active,
      frozen: Object.isFrozen(first), fields: Object.keys(first).sort() };
    const pending = h.grid.renderMore();
    const same = pending === h.grid.renderMore();
    const stopped = h.grid.cancelBinding();
    const aborted = await pending.then(() => "resolved", cause => cause.name);
    const resumed = await h.grid.renderMore();
    h.grid.refresh(); const old = h.grid.whenBound();
    h.grid.setFilter(row => row.index % 2 === 1);
    const stale = await old.then(() => "resolved", cause => cause.name);
    const filtered = await h.grid.whenBound();
    h.grid.setFilter(null);
    let completed = await h.grid.whenBound();
    while (!completed.last) completed = await h.grid.renderMore();
    const beforeExhausted = h.binds.length;
    const exhausted = await h.grid.renderMore();
    const noDuplicate = h.binds.length === beforeExhausted;
    const defaults = h.rows.entries()[0].value;
    h.rows.append([18, 19].map(index => ({ ...defaults, index, name: 'Loaded ' + index })));
    const appended = await h.grid.whenBound();
    const ids = [...h.table.querySelectorAll('tbody [data-field="name"]')].map(field => field.textContent);
    h.grid.refresh(); const removal = h.grid.whenBound();
    h.grid.dispose();
    const removed = await removal.then(() => "resolved", cause => cause.name);
    const restored = h.table.outerHTML === h.original && h.active === 0;
    const after = h.table.outerHTML, callbacks = h.binds.length;
    h.rows.set(h.rows.entries()[0].id, "name", "Late update");
    await new Promise(resolve => setTimeout(resolve, 20));
    const quiet = h.table.outerHTML === after && callbacks === h.binds.length;
    h.rows.dispose(); h.root.remove(); delete state.progressive;
    return { initial, same, stopped: { available: stopped.available, last: stopped.last }, aborted,
      resumed: { available: resumed.available, first: resumed.first, last: resumed.last }, stale,
      filtered: { available: filtered.available, visible: filtered.visible, first: filtered.first, last: filtered.last },
      completed: { available: completed.available, mounted: completed.mounted, last: completed.last },
      exhausted: exhausted.available, noDuplicate, appended: { available: appended.available, total: appended.total,
        first: appended.first, last: appended.last, event: appended.event?.type }, ids, removed, restored, quiet };
  });
  assert.deepEqual(progressive.initial, { total: 17, filtered: 17, visible: 17, mounted: 5,
    available: 5, first: true, last: false, event: null, active: 5, frozen: true,
    fields: ["available", "event", "filtered", "first", "last", "mounted", "total", "visible"] });
  assert(progressive.same && progressive.noDuplicate, "Installed continuation must share pending work and avoid exhausted callbacks.");
  assert.deepEqual(progressive.stopped, { available: 5, last: false });
  assert.equal(progressive.aborted, "AbortError");
  assert.deepEqual(progressive.resumed, { available: 10, first: false, last: false });
  assert.equal(progressive.stale, "AbortError");
  assert.deepEqual(progressive.filtered, { available: 5, visible: 8, first: true, last: false });
  assert.deepEqual(progressive.completed, { available: 17, mounted: 17, last: true });
  assert.equal(progressive.exhausted, 17);
  assert.deepEqual(progressive.appended, { available: 19, total: 19, first: false, last: true, event: "append" });
  assert.deepEqual(progressive.ids, Array.from({ length: 19 }, (_, index) => 'Loaded ' + (index + 1)));
  assert.equal(progressive.removed, "AbortError");
  assert(progressive.restored && progressive.quiet, "Installed progressive teardown must restore authored markup and stop late work.");

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

  const pinned = await page.evaluate(async () => {
    const h = window.packedConsumer.pinned;
    const settle = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await settle(); h.root.scrollLeft = 180; await settle();
    const first = h.table.tBodies[0].rows[0].cells[0], second = h.table.tBodies[0].rows[0].cells[1];
    const input = first.querySelector("input"); input.focus(); input.value = "Pinned draft"; input.setSelectionRange(1, 4);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const gap = () => second.getBoundingClientRect().left - first.getBoundingClientRect().right;
    const initialGap = gap(), initialLeft = first.getBoundingClientRect().left;
    h.grid.setColumns(h.grid.columns().map(column => column.key === "name" ? { ...column, width: 185 } : column));
    await settle();
    const resizedGap = gap();
    const stableLeft = Math.abs(first.getBoundingClientRect().left - initialLeft) < 1;
    const kept = document.activeElement === input && input.value === "Pinned draft" && input.selectionStart === 1 && input.selectionEnd === 4;
    const state = h.grid.columns();
    h.grid.setColumns([state[1], state[0], state[2]]); await settle();
    const reordered = h.grid.columns().map(column => column.key);
    const copied = h.grid.columns().map(column => ({ ...column }));
    let invalid = "";
    try { h.grid.setColumns(copied.map((column, index) => ({ ...column, pinned: index === 1 }))); }
    catch (cause) { invalid = cause.code; }
    const protectedState = h.grid.columns().every((column, index) => column.key === copied[index].key && column.pinned === copied[index].pinned);
    const result = { initialGap, resizedGap, stableLeft,
      kept, pinned: state.map(column => column.pinned ?? false), reordered, invalid, protectedState,
      mixed: !h.table.tFoot.querySelector("td").hasAttribute("data-pinned-column"), changes: h.rows.changes().length };
    h.grid.dispose(); await settle();
    result.restored = h.table.outerHTML === h.original;
    h.root.dispatchEvent(new Event("scroll")); h.rows.set(1, "name", "After disposal"); await settle();
    result.quiet = h.table.outerHTML === h.original;
    h.rows.dispose(); h.root.remove();
    return result;
  });
  assert(Math.abs(pinned.initialGap - 2) < 1 && Math.abs(pinned.resizedGap - 2) < 1,
    "Installed pinned columns must use measured native starts, including spacing, before and after width changes.");
  assert(pinned.stableLeft && pinned.kept && pinned.mixed && pinned.protectedState && pinned.restored && pinned.quiet);
  assert.deepEqual(pinned.pinned, [true, true, false]);
  assert.deepEqual(pinned.reordered, ["note", "name", "amount"]);
  assert.equal(pinned.invalid, "GRID_COLUMNS");
  assert.equal(pinned.changes, 0);

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

  assert.deepEqual(await page.evaluate(async () => {
    const result = await window.packedConsumer.screens.a.grid.whenBound();
    return { ...result, frozen: Object.isFrozen(result) };
  }), { total: 2, filtered: 2, visible: 1, mounted: 1, available: 1, first: true, last: true, event: null, frozen: true },
  "Installed default synchronous completion uses the same immutable result contract.");

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

  assert.deepEqual(await page.evaluate(() => {
    const screen = window.packedConsumer.screens.a;
    const table = document.querySelector('[data-host="a"] [data-consumer-grid]');
    const cell = table.tBodies[0].rows[0].cells[1];
    table.tabIndex = -1;
    cell.click();
    const activated = { active: screen.grid.selected(), ids: screen.grid.selectedIds() };
    cell.click();
    const cleared = { active: screen.grid.selected(), ids: screen.grid.selectedIds() };
    cell.querySelector("label").click();
    table.removeAttribute("tabindex");
    return { activated, cleared, afterLabel: screen.grid.selected(), checks: screen.grid.checkedIds(),
      other: window.packedConsumer.screens.b.grid.selected() };
  }), { activated: { active: 1, ids: [1] }, cleared: { active: null, ids: [] },
    afterLabel: null, checks: [], other: null },
  "Installed row activation must use current identity, toggle once and exclude labels independently of table focusability.");

  const first = page.locator('[data-host="a"]');
  const selectionButton = first.locator("[data-select-row]");
  await selectionButton.click();
  await expect(selectionButton).toHaveAttribute("aria-pressed", "true");
  await selectionButton.click();
  await expect(selectionButton).toHaveAttribute("aria-pressed", "false");
  await selectionButton.press("Space");
  await expect(selectionButton).toHaveAttribute("aria-pressed", "true");
  await selectionButton.press("Enter");
  await expect(selectionButton).toHaveAttribute("aria-pressed", "false");
  assert.deepEqual(await page.evaluate(() => {
    const { grid, rows } = window.packedConsumer.screens.a;
    const id = rows.entries()[0].id;
    const toggled = { active: grid.selected(), selected: grid.selectedIds(), checked: grid.checkedIds() };
    grid.select(id); grid.select(id);
    return { toggled, absolute: grid.selected(), selected: grid.selectedIds(), other: window.packedConsumer.screens.b.grid.selected() };
  }), { toggled: { active: null, selected: [], checked: [] }, absolute: 1, selected: [], other: null },
  "Installed native toggles must clear active state while absolute calls and independent CVC screens retain their contracts.");
  const choiceSearch = first.locator('[data-filter-search="choice"]');
  await choiceSearch.fill("twENTY");
  assert.equal(await page.evaluate(() => window.packedConsumer.screens.a.grid.columnFilter("choice")), null);
  await choiceSearch.press("Enter");
  assert.deepEqual(await page.evaluate(() => window.packedConsumer.screens.a.grid.columnFilter("choice")), [22]);
  await expect(first.locator('[data-consumer-grid] tbody [data-field="person.name"]')).toHaveText("Off page");
  await choiceSearch.fill("   ");
  await first.locator('[data-apply-filter="choice"]').click();
  await expect(choiceSearch).toHaveValue("");
  await expect(first.locator('[data-consumer-grid] tbody [data-field="person.name"]')).toHaveText("Ada");
  assert.deepEqual(await page.evaluate(() => {
    const screen = window.packedConsumer.screens.a;
    screen.grid.setColumnFilter("person", ["Ada"]);
    const choices = screen.grid.filterChoices("choice");
    screen.grid.setColumnFilter("person", null);
    screen.grid.select(null); screen.grid.setSelected([]); screen.grid.setChecked([]);
    screen.gridEvents.length = 0;
    return choices;
  }), [{ value: 11, label: "Eleven", count: 1 }, { value: 22, label: "Twenty two", count: 0 }],
  "Installed choice counts must retain zero-count values after another column filter.");
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

// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { RowId, Rows } from "../../src/data/index.js";
import type { FormHandle } from "../../src/ui/index.js";
import type { bindForm } from "../../src/ui/form.js";
import type { bindSelect } from "../../src/ui/select.js";

type Values = Record<string, unknown>;
type Options = NonNullable<Parameters<typeof bindForm<Values>>[1]>;
type Failure = { code?: string; message?: string; detail?: Readonly<Record<string, unknown>>; cause?: unknown };
declare global {
  interface Window {
    formDiscovery: {
      api: { bindForm: typeof bindForm; bindSelect: typeof bindSelect };
      rows: Rows<Values>; ids: readonly RowId[];
      root(html: string): HTMLFormElement;
      field<E extends HTMLElement = HTMLInputElement>(root: ParentNode, name?: string): E;
      add(root: HTMLElement, html: string): void;
      edit(input: HTMLInputElement, value: string): void;
      files(input: HTMLInputElement, files: readonly File[]): void;
      error(action: () => unknown): Failure | null;
    };
  }
}
const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close()); await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindForm, bindSelect }, { createRows }] = await Promise.all([import(modules.ui), import(modules.data)]);
    const first: Values = { name: "Ada", note: "One", count: 1200, choice: 1,
      choices: [{ label: "First", value: 1 }, { label: "Second", value: 2 }], profile: { city: "Seoul" }, hidden: { token: "business" } };
    const rows: Rows<Values> = createRows([first, { ...first, name: "Beatrice", note: "Two", count: 2400 }]);
    window.formDiscovery = {
      api: { bindForm, bindSelect }, rows, ids: rows.entries().map(row => row.id),
      root(html) { const root = document.createElement("form"); root.innerHTML = html; document.body.append(root); return root; },
      field: (root, name = "name") => root.querySelector(`[data-field="${name}"]`)! as never,
      add(root, html) { root.insertAdjacentHTML("beforeend", html); },
      edit(input, value) { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); },
      files(input, files) { const transfer = new DataTransfer(); for (const file of files) transfer.items.add(file); input.files = transfer.files; },
      error(action) { try { action(); return null; } catch (cause) { return cause as Failure; } }
    };
  }, modules);
});

test("rescan adopts Rows fields without callbacks projection validation commits or identity changes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture"><span data-field="note">Authored</span>');
    let calls: string[] = [];
    const form = h.api.bindForm(root, { rows: h.rows, beforeBind: () => { calls.push("before"); }, onBind: () => { calls.push("after"); },
      beforeBindValue: () => { calls.push("beforeValue"); }, onBindValue: () => { calls.push("afterValue"); },
      parse: { count: value => { calls.push("parse"); return Number(value); } },
      rules: { format: { mark: value => { calls.push("format"); return `[${value}]`; } }, validate: { check: () => { calls.push("validate"); return true; } } },
      render: { note: value => { calls.push("render"); return String(value); } } });
    form.bind(h.ids[0]); calls = [];
    h.add(root, '<input data-field="count" value="007" data-format=\'[["mark"]]\' data-validate=\'[["check"]]\'>');
    const before = h.rows.entries(), events: string[] = [], unsubscribe = h.rows.subscribe(event => events.push(event.type));
    form.rescan(); const adopted = { value: h.field(root, "count").value, calls: [...calls], raw: form.read(), unchanged: before === h.rows.entries(), events };
    form.refresh(["count"]); unsubscribe();
    return { adopted, refreshed: h.field(root, "count").value, calls, source: h.rows.get(h.ids[0])!.value.count };
  });
  expect(result.adopted).toEqual({ value: "007", calls: [], raw: { name: "Ada", note: "One", count: 1200 }, unchanged: true, events: [] });
  expect(result.refreshed).toBe("[1200]"); expect(result.source).toBe(1200);
  expect(result.calls).toEqual(["beforeValue", "format", "afterValue"]);
});

test("appended nested fields become readable and selectively refresh while missing source keys stay undefined", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture">'), form = h.api.bindForm(root, { rows: h.rows }); form.bind(h.ids[0]);
    h.add(root, '<input data-field="profile.city" value="Preset city"><input data-field="missing" value="Preset missing">');
    const undiscovered = form.read(); form.rescan(); const adopted = { raw: form.read(), city: h.field(root, "profile.city").value, missing: h.field(root, "missing").value };
    form.refresh(["profile.city", "missing"]); h.edit(h.field(root, "profile.city"), "Busan");
    return { undiscovered, adopted, missing: h.field(root, "missing").value, committed: h.rows.get(h.ids[0])!.value.profile, defaults: form.defaults() };
  });
  expect(result).toEqual({ undiscovered: { name: "Ada" }, adopted: { raw: { name: "Ada", profile: { city: "Seoul" }, missing: undefined }, city: "Preset city", missing: "Preset missing" },
    missing: "", committed: { city: "Busan" }, defaults: { name: "Capture", profile: { city: "Preset city" }, missing: "Preset missing" } });
});

test("new local formatted fields capture raw before projection and no-op rescan never captures displayed text", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture">'); let formats = 0;
    const form = h.api.bindForm(root, { rules: { format: { money: value => { formats++; return `$${value}`; } } } });
    h.add(root, '<input data-field="count" value="1200" data-format=\'[["money"]]\'>'); form.rescan();
    const adopted = { value: h.field(root, "count").value, formats, defaults: form.defaults() };
    form.refresh(["count"]); const projected = h.field(root, "count").value; form.rescan();
    const retained = { value: h.field(root, "count").value, raw: form.read().count, defaults: form.defaults(), formats };
    h.edit(h.field(root, "count"), "2400"); form.unbind();
    return { adopted, projected, retained, restored: h.field(root, "count").value };
  });
  expect(result).toEqual({ adopted: { value: "1200", formats: 0, defaults: { name: "Capture", count: "1200" } }, projected: "$1200",
    retained: { value: "$1200", raw: "1200", defaults: { name: "Capture", count: "1200" }, formats: 1 }, restored: "1200" });
});

test("compatible field reordering preserves focused invalid input caret errors and creation captures", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<label><input data-field="name" value="Capture" required></label><output data-error-for="name"></output><input data-field="note" value="Note capture">');
    const form = h.api.bindForm(root, { rows: h.rows }); form.bind(h.ids[0]); const input = h.field<HTMLInputElement>(root);
    input.focus(); h.edit(input, ""); input.setSelectionRange(0, 0); const message = root.querySelector("output")!.textContent, described = input.getAttribute("aria-describedby");
    root.prepend(h.field(root, "note")); form.rescan(); form.rescan();
    const retained = { value: input.value, focused: document.activeElement === input, caret: input.selectionStart, message: root.querySelector("output")!.textContent,
      described: input.getAttribute("aria-describedby"), invalid: input.getAttribute("aria-invalid"), defaults: form.defaults(), raw: form.read() };
    form.bind(h.ids[1]); form.bind(h.ids[0]);
    return { retained, expectedMessage: message, expectedDescribed: described, draft: input.value, source: h.rows.get(h.ids[0])!.value.name };
  });
  expect(result.retained).toEqual({ value: "", focused: true, caret: 0, message: result.expectedMessage, described: result.expectedDescribed,
    invalid: "true", defaults: { note: "Note capture", name: "Capture" }, raw: { note: "One", name: "Ada" } });
  expect(result.expectedMessage).not.toBe(""); expect(result.draft).toBe(""); expect(result.source).toBe("Ada");
});

test("replacing an error region republishes known issues and preserves the field draft without running rules", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture" aria-describedby="help" data-validate=\'[["check"]]\'><output data-error-for="name">Old authored</output>');
    let validations = 0; const form = h.api.bindForm(root, { rows: h.rows, rules: { validate: { check: () => { validations++; return "Known issue"; } } } }); form.bind(h.ids[0]);
    h.edit(h.field(root), "Draft"); const input = h.field<HTMLInputElement>(root), old = root.querySelector("output")!, oldId = old.id;
    const next = document.createElement("output"); next.setAttribute("data-error-for", "name"); next.textContent = "New authored"; old.replaceWith(next);
    validations = 0; form.rescan(); const adopted = { oldId: old.getAttribute("id"), oldLive: old.getAttribute("aria-live"), oldText: old.textContent,
      idChanged: next.id !== oldId && next.id !== "", described: input.getAttribute("aria-describedby"), nextId: next.id, nextText: next.textContent,
      invalid: input.getAttribute("aria-invalid"), value: input.value, validations };
    form.bind(h.ids[1]); form.bind(h.ids[0]); const draft = input.value; form.dispose();
    return { adopted, draft, disposed: { described: input.getAttribute("aria-describedby"), id: next.getAttribute("id"), live: next.getAttribute("aria-live"), text: next.textContent } };
  });
  expect(result.adopted).toEqual({ oldId: null, oldLive: null, oldText: "Old authored", idChanged: true,
    described: `help ${result.adopted.nextId}`, nextId: result.adopted.nextId, nextText: "Known issue", invalid: "true", value: "Draft", validations: 0 });
  expect(result.draft).toBe("Draft"); expect(result.disposed).toEqual({ described: "help", id: null, live: null, text: "New authored" });
});

test("retiring clean fields drops read and defaults releases metadata and keeps business rows and subscriptions", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture" aria-describedby="help" data-field-changed="authored"><output data-error-for="name">Hint</output><input data-field="note" value="Note capture">');
    const form = h.api.bindForm(root, { rows: h.rows }); form.bind(h.ids[0]); const input = h.field<HTMLInputElement>(root), before = h.rows.entries();
    input.removeAttribute("data-field"); form.rescan();
    const retired = { raw: form.read(), defaults: form.defaults(), described: input.getAttribute("aria-describedby"), changed: input.getAttribute("data-field-changed"),
      region: root.querySelector("output")!.outerHTML, unchanged: before === h.rows.entries() };
    h.edit(input, "Detached"); h.rows.set(h.ids[0], "note", "Updated note");
    return { retired, quiet: h.rows.get(h.ids[0])!.value.name, retained: h.field(root, "note").value };
  });
  expect(result).toEqual({ retired: { raw: { note: "One" }, defaults: { note: "Note capture" }, described: "help", changed: "authored",
    region: '<output data-error-for="name">Hint</output>', unchanged: true }, quiet: "Ada", retained: "Updated note" });
});

test("a clean same-path replacement gets its own capture while the retired node loses Form ownership", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Old capture" aria-describedby="old-help">'), form = h.api.bindForm(root, { rows: h.rows }); form.bind(h.ids[0]);
    const old = h.field<HTMLInputElement>(root), next = document.createElement("input"); next.setAttribute("data-field", "name"); next.value = "Replacement capture"; old.replaceWith(next);
    const before = h.rows.entries(); form.rescan(); const adopted = { value: next.value, defaults: form.defaults(), raw: form.read(), unchanged: before === h.rows.entries(), oldDescription: old.getAttribute("aria-describedby") };
    form.refresh(["name"]); h.edit(next, "Current"); form.unbind(); root.append(old); old.removeAttribute("data-field"); h.edit(old, "Ignored");
    return { adopted, restored: next.value, source: h.rows.get(h.ids[0])!.value.name };
  });
  expect(result).toEqual({ adopted: { value: "Replacement capture", defaults: { name: "Replacement capture" }, raw: { name: "Ada" }, unchanged: true, oldDescription: "old-help" },
    restored: "Replacement capture", source: "Current" });
});

test("clean radio reshaping captures the entire current group without mixing old creation checks", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input type="radio" name="level" data-field="level" value="a" checked aria-describedby="help"><input type="radio" name="level" data-field="level" value="b"><output data-error-for="level"></output>');
    const form = h.api.bindForm(root), originalDescription = h.field(root, "level").getAttribute("aria-describedby");
    h.add(root, '<input type="radio" name="level" data-field="level" value="c">');
    const members = [...root.querySelectorAll<HTMLInputElement>("input")]; members[2].checked = true; form.rescan(); const defaults = form.defaults();
    members[1].checked = true; form.unbind(); const restored = members.map(input => input.checked); form.dispose();
    return { defaults, restored, capturedValue: members.map(input => input.value), oldGenerated: originalDescription,
      descriptions: members.map(input => input.getAttribute("aria-describedby")) };
  });
  expect(result.defaults).toEqual({ level: "c" }); expect(result.restored).toEqual([false, false, true]); expect(result.capturedValue).toEqual(["a", "b", "c"]);
  expect(result.oldGenerated).toContain("help "); expect(result.descriptions).toEqual(["help", null, null]);
});

test("clean checkbox reshaping changes stable value shape and captures current surviving checkedness", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input type="checkbox" data-field="channels" value="a" checked>'), form = h.api.bindForm(root);
    h.field<HTMLInputElement>(root, "channels").checked = false; h.add(root, '<input type="checkbox" data-field="channels" value="b" checked>'); form.rescan();
    const group = { defaults: form.defaults(), raw: form.read() }; const inputs = [...root.querySelectorAll<HTMLInputElement>("input")]; inputs[0].checked = true; inputs[1].checked = false; form.unbind();
    const restored = inputs.map(input => input.checked); inputs[0].remove(); form.rescan(); inputs[1].checked = false; form.unbind();
    return { group, restored, single: form.read(), defaults: form.defaults() };
  });
  expect(result).toEqual({ group: { defaults: { channels: ["b"] }, raw: { channels: ["b"] } }, restored: [false, true], single: { channels: true }, defaults: { channels: true } });
});

test("retiring a field with a current row draft fails before ownership changes and the old owner can resolve it", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture" required><output data-error-for="name"></output>'), form = h.api.bindForm(root, { rows: h.rows }); form.bind(h.ids[0]);
    const input = h.field<HTMLInputElement>(root); h.edit(input, ""); const errorText = root.querySelector("output")!.textContent, before = h.rows.entries(); input.removeAttribute("data-field");
    const error = h.error(() => form.rescan()); const retained = { value: input.value, error: root.querySelector("output")!.textContent, unchanged: before === h.rows.entries(), raw: form.read() };
    h.edit(input, "Resolved"); form.rescan();
    return { code: error?.code, field: error?.detail?.field, rowId: error?.detail?.rowId, retained, errorText, removed: form.read(), source: h.rows.get(h.ids[0])!.value.name };
  });
  expect(result).toEqual({ code: "FORM_RESCAN", field: "name", rowId: 1, retained: { value: "", error: result.errorText, unchanged: true, raw: { name: "Ada" } }, errorText: result.errorText, removed: {}, source: "Resolved" });
  expect(result.errorText).not.toBe("");
});

test("replacing a field is rejected for an affected draft retained on another row", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture" required><input data-field="note" value="Note capture">'), form = h.api.bindForm(root, { rows: h.rows });
    form.bind(h.ids[0]); h.edit(h.field(root), ""); form.bind(h.ids[1]); const old = h.field<HTMLInputElement>(root), next = old.cloneNode() as HTMLInputElement; next.value = "Replacement"; old.replaceWith(next);
    const error = h.error(() => form.rescan()); next.replaceWith(old); form.bind(h.ids[0]); const draft = old.value;
    h.edit(old, "Resolved"); form.bind(h.ids[1]); old.replaceWith(next); form.rescan();
    return { code: error?.code, rowId: error?.detail?.rowId, field: error?.detail?.field, draft, adopted: next.value, defaults: form.defaults(), source: h.rows.get(h.ids[1])!.value.name };
  });
  expect(result).toEqual({ code: "FORM_RESCAN", rowId: 1, field: "name", draft: "", adopted: "Replacement", defaults: { name: "Replacement", note: "Note capture" }, source: "Beatrice" });
});

test("a valid superseded candidate still blocks retirement without running parsers to classify its draft", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="count" value="7"><input data-field="note" value="Note">'); let armed = false, parses = 0;
    const form = h.api.bindForm(root, { rows: h.rows, parse: { count: value => { parses++; if (armed) { armed = false; h.rows.set(h.ids[0], "note", "Application update"); } return Number(value); } } });
    form.bind(h.ids[0]); armed = true; const input = h.field<HTMLInputElement>(root, "count"); h.edit(input, "34"); input.removeAttribute("data-field"); parses = 0;
    const error = h.error(() => form.rescan()), blocked = { value: input.value, count: h.rows.get(h.ids[0])!.value.count, parses, invalid: input.getAttribute("aria-invalid") };
    h.edit(input, "56"); form.rescan();
    return { code: error?.code, field: error?.detail?.field, blocked, source: h.rows.get(h.ids[0])!.value.count, raw: form.read() };
  });
  expect(result).toEqual({ code: "FORM_RESCAN", field: "count", blocked: { value: "34", count: 1200, parses: 0, invalid: null }, source: 56, raw: { note: "Application update" } });
});

test("known invalid local input blocks retirement until the application resolves it", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture" required><output data-error-for="name"></output>'), form = h.api.bindForm(root), input = h.field<HTMLInputElement>(root);
    h.edit(input, ""); input.removeAttribute("data-field"); const before = root.innerHTML, error = h.error(() => form.rescan());
    const retained = { value: input.value, invalid: input.getAttribute("aria-invalid"), sameMarkup: before === root.innerHTML, raw: form.read() };
    h.edit(input, "Resolved"); form.rescan(); h.edit(input, "No longer bound");
    return { code: error?.code, field: error?.detail?.field, retained, raw: form.read(), defaults: form.defaults(), value: input.value };
  });
  expect(result).toEqual({ code: "FORM_RESCAN", field: "name", retained: { value: "", invalid: "true", sameMarkup: true, raw: { name: "" } }, raw: {}, defaults: {}, value: "No longer bound" });
});

test("still-owned binding annotations and native shapes require explicit release before mutation", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery;
    return ["field", "format", "validate", "type", "multiple", "group-value", "radio-name", "options"].map(mode => {
      const html = mode === "multiple" ? '<select data-field="name"><option>A</option></select>' : mode === "options" ?
        '<select data-field="choice" data-options="choices" data-option-label="label" data-option-value="value"><option value="">Authored</option></select>' :
        mode === "group-value" || mode === "radio-name" ? '<input type="radio" name="level" data-field="name" value="a"><input type="radio" name="level" data-field="name" value="b">' : '<input data-field="name" value="Capture">';
      const root = h.root(html), form = h.api.bindForm(root, mode === "options" ? { rows: h.rows } : {}), input = h.field<HTMLElement>(root, mode === "options" ? "choice" : "name");
      if (mode === "field") input.setAttribute("data-field", "note");
      else if (mode === "format") input.setAttribute("data-format", '[["upper"]]');
      else if (mode === "validate") input.setAttribute("data-validate", '[["required"]]');
      else if (mode === "type") (input as HTMLInputElement).type = "number";
      else if (mode === "multiple") (input as HTMLSelectElement).multiple = true;
      else if (mode === "group-value") (input as HTMLInputElement).value = "changed";
      else if (mode === "radio-name") (input as HTMLInputElement).name = "changed";
      else input.setAttribute("data-options", "otherChoices");
      const before = root.innerHTML, error = h.error(() => form.rescan()), sameMarkup = before === root.innerHTML; form.dispose();
      return { mode, code: error?.code, sameMarkup };
    });
  });
  expect(result).toEqual(["field", "format", "validate", "type", "multiple", "group-value", "radio-name", "options"].map(mode => ({ mode, code: "FORM_RESCAN", sameMarkup: true })));
});

test("release change and readopt on the same node establishes new declarations and a new live capture", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="old" data-format=\'[["upper"]]\'>'), form = h.api.bindForm(root), input = h.field<HTMLInputElement>(root);
    h.edit(input, "latest"); input.removeAttribute("data-field"); form.rescan(); const released = { value: input.value, raw: form.read(), defaults: form.defaults() };
    input.value = "Preset"; input.setAttribute("data-format", '[["lower"]]'); input.setAttribute("data-field", "note"); form.rescan();
    const adopted = { value: input.value, defaults: form.defaults() }; form.refresh(["note"]); const projected = input.value; h.edit(input, "OTHER"); form.unbind();
    return { released, adopted, projected, restored: input.value };
  });
  expect(result).toEqual({ released: { value: "latest", raw: {}, defaults: {} }, adopted: { value: "Preset", defaults: { note: "Preset" } }, projected: "preset", restored: "Preset" });
});

test("new HTML fields use captured catalogs and future parsers while a known renderer may be temporarily absent", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<span data-field="note"><b>Authored</b></span>'); let calls = 0;
    const options: Options = { parse: { count: value => Number(value) }, rules: { format: { label: value => `old:${value}` } },
      render: { note: value => { calls++; return `shown:${value}`; } } };
    const form = h.api.bindForm(root, options), note = h.field<HTMLElement>(root, "note"); calls = 0; note.removeAttribute("data-field"); form.rescan();
    options.parse!.count = () => 99; options.rules!.format!.label = value => `new:${value}`;
    h.add(root, '<input data-field="count" value="007" data-format=\'[["label"]]\'>'); form.rescan();
    const adopted = { calls, value: h.field(root, "count").value, defaults: form.defaults() }; form.refresh(["count"]);
    note.setAttribute("data-field", "note"); form.rescan(); const beforeRefresh = { calls, note: note.innerHTML }; form.refresh(["note"]);
    const bad = h.root('<input data-field="name">'), unknown = h.error(() => h.api.bindForm(bad, { render: { absent: () => "Never" } }))?.code;
    return { adopted, projected: h.field(root, "count").value, beforeRefresh, note: note.textContent, unknown };
  });
  expect(result).toEqual({ adopted: { calls: 0, value: "007", defaults: { count: 7 } }, projected: "old:007",
    beforeRefresh: { calls: 0, note: "<b>Authored</b>" }, note: "shown:Authored", unknown: "UI_RENDER" });
});

test("malformed new candidates retain specific preflight errors and leave the compiled owner usable", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery;
    return [
      { html: '<input data-field="bad..path">', code: "FIELD_PATH" },
      { html: '<input data-field="note" data-format=\'[["unknown-rule"]]\'>', code: "RULE_UNKNOWN" },
      { html: '<input data-field="note" data-validate="not-json">', code: "RULE_DECLARATION" },
      { html: '<input data-field="name">', code: "FORM_FIELD_REPEAT" },
      { html: '<input type="checkbox" data-field="flags" value="a"><input type="checkbox" data-field="flags" value="a">', code: "FORM_GROUP_VALUE" },
      { html: '<span data-field="note" data-format=\'[["upper"]]\'><input></span>', code: "FORM_FORMAT_CONTROL" }
    ].map(({ html, code }) => {
      const root = h.root('<input data-field="name" value="Capture">'), form = h.api.bindForm(root); h.add(root, '<section>' + html + '</section>');
      const section = root.querySelector("section")!, before = root.innerHTML, error = h.error(() => form.rescan()), unchanged = before === root.innerHTML;
      section.remove(); h.edit(h.field(root), "Still active"); form.rescan();
      return { expected: code, code: error?.code, unchanged, raw: form.read(), defaults: form.defaults() };
    });
  });
  for (const item of result) expect(item).toEqual({ expected: item.expected, code: item.expected, unchanged: true, raw: { name: "Still active" }, defaults: { name: "Capture" } });
});

test("Select claim conflicts roll back newly acquired claims and preserve retained fields for retry", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture">'), form = h.api.bindForm(root);
    h.add(root, '<select data-field="first"><option value="a">A</option></select><select data-field="second"><option value="b">B</option></select>');
    const first = h.field<HTMLSelectElement>(root, "first"), second = h.field<HTMLSelectElement>(root, "second"), external = h.api.bindSelect(second, { choices: [] });
    const before = root.innerHTML, error = h.error(() => form.rescan()), unchanged = before === root.innerHTML;
    const temporary = h.api.bindSelect(first, { choices: [] }); temporary.dispose(); external.dispose(); form.rescan();
    const claimed = h.error(() => h.api.bindSelect(second, { choices: [] }))?.code, defaults = form.defaults(); form.dispose();
    const released = h.api.bindSelect(first, { choices: [] }); released.dispose();
    return { code: error?.code, unchanged, claimed, defaults, rawAfterDispose: h.error(() => form.read())?.code };
  });
  expect(result).toEqual({ code: "SELECT_OWNED", unchanged: true, claimed: "SELECT_OWNED", defaults: { name: "Capture", first: "a", second: "b" }, rawAfterDispose: "FORM_DISPOSED" });
});

test("new marked choices retain authored nodes until refresh then retire with exact option and ownership restoration", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture">'), form = h.api.bindForm(root, { rows: h.rows }); form.bind(h.ids[0]);
    h.add(root, '<select data-field="choice" data-options="choices" data-option-label="label" data-option-value="value"><!--keep--><option value="" selected>Choose</option></select>');
    const select = h.field<HTMLSelectElement>(root, "choice"), authored = [...select.childNodes], before = h.rows.entries(); form.rescan();
    const adopted = { options: select.options.length, selected: select.value, defaults: form.defaults(), unchanged: before === h.rows.entries() };
    form.refresh(["choice"]); const projected = { options: select.options.length, label: select.selectedOptions[0].textContent, raw: form.read().choice };
    const generated = [...select.childNodes]; select.removeAttribute("data-field"); const orphan = h.error(() => form.rescan())?.code;
    const orphanUnchanged = [...select.childNodes].every((node, index) => node === generated[index]) && select.childNodes.length === generated.length;
    select.setAttribute("data-field", "choice"); select.remove(); form.rescan();
    const retired = { exact: [...select.childNodes].every((node, index) => node === authored[index]) && select.childNodes.length === authored.length, value: select.value, raw: form.read(), defaults: form.defaults() };
    const standalone = h.api.bindSelect(select, { choices: [] }); standalone.dispose();
    return { adopted, projected, orphan, orphanUnchanged, retired, source: h.rows.get(h.ids[0])!.value.choice };
  });
  expect(result).toEqual({ adopted: { options: 1, selected: "", defaults: { name: "Capture", choice: null }, unchanged: true },
    projected: { options: 3, label: "First", raw: 1 }, orphan: "FORM_OPTIONS", orphanUnchanged: true,
    retired: { exact: true, value: "", raw: { name: "Ada" }, defaults: { name: "Capture" } }, source: 1 });
});

test("new unmarked Select captures option identity without taking ownership of later application options", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture">'), form = h.api.bindForm(root);
    h.add(root, '<select data-field="choice" multiple><option value="same" selected>First</option><option value="same">Second</option></select>');
    const select = h.field<HTMLSelectElement>(root, "choice"), first = select.options[0], second = select.options[1]; form.rescan();
    select.append(first); const added = new Option("Added", "added", false, true); select.append(added); second.selected = true; first.selected = false;
    form.unbind(); const restored = { order: [...select.options].map(option => option.text), selected: [...select.options].map(option => option.selected), defaults: form.defaults() };
    select.removeAttribute("data-field"); form.rescan(); const standalone = h.api.bindSelect(select, { choices: [] }); standalone.dispose();
    return { restored, retained: select.options[0] === second && select.options[1] === first && select.options[2] === added };
  });
  expect(result).toEqual({ restored: { order: ["Second", "First", "Added"], selected: [false, true, false], defaults: { name: "Capture", choice: ["same"] } }, retained: true });
});

test("late file adoption privately captures every selected File and retirement releases the native control", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture">'), form = h.api.bindForm(root);
    h.add(root, '<input type="file" data-field="upload">'); const input = h.field<HTMLInputElement>(root, "upload");
    h.files(input, [new File(["one"], "one.txt", { lastModified: 12 }), new File(["two"], "two.txt", { lastModified: 34 })]); form.rescan(); const defaults = form.defaults();
    h.files(input, [new File(["new"], "new.txt")]); form.unbind(); const files = await Promise.all([...input.files!].map(async file => ({ name: file.name, text: await file.text(), time: file.lastModified })));
    input.removeAttribute("data-field"); form.rescan(); const retired = { defaults: form.defaults(), raw: form.read() };
    h.files(input, [new File(["outside"], "outside.txt")]); form.unbind(); form.dispose();
    return { defaults, files, retired, current: input.files![0].name };
  });
  expect(result).toEqual({ defaults: { name: "Capture", upload: "one.txt" }, files: [{ name: "one.txt", text: "one", time: 12 }, { name: "two.txt", text: "two", time: 34 }],
    retired: { defaults: { name: "Capture" }, raw: { name: "Capture" } }, current: "outside.txt" });
});

test("rescan and selected refresh preserve local inactivity until an explicit full refresh resumes it", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture" data-format=\'[["upper"]]\'>'), form = h.api.bindForm(root); form.unbind();
    h.add(root, '<input data-field="note" value="Preset" data-format=\'[["upper"]]\'>'); form.rescan(); h.edit(h.field(root), "quiet"); h.edit(h.field(root, "note"), "new quiet");
    const inactive = { name: h.field(root).value, note: h.field(root, "note").value }; form.refresh(["note"]); const manual = h.field(root, "note").value;
    h.edit(h.field(root, "note"), "still quiet"); const selected = h.field(root, "note").value; form.refresh(); h.edit(h.field(root, "note"), "resumed");
    return { inactive, manual, selected, resumed: h.field(root, "note").value, defaults: form.defaults() };
  });
  expect(result).toEqual({ inactive: { name: "quiet", note: "new quiet" }, manual: "NEW QUIET", selected: "still quiet", resumed: "RESUMED", defaults: { name: "Capture", note: "Preset" } });
});

test("moving an unchanged control to another native form preserves capture raw and the new reset ownership", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formDiscovery, root = document.createElement("div"); root.innerHTML = '<form data-owner="old"><input data-field="name" value="Native" data-format=\'[["upper"]]\'></form><form data-owner="new"></form>'; document.body.append(root);
    const input = h.field<HTMLInputElement>(root); input.value = "Capture"; const form = h.api.bindForm(root), old = root.querySelectorAll("form")[0], next = root.querySelectorAll("form")[1];
    h.edit(input, "Edited"); next.append(input); form.rescan(); const moved = { value: input.value, raw: form.read(), defaults: form.defaults() };
    old.reset(); await new Promise<void>(resolve => setTimeout(resolve, 0)); const oldReset = input.value;
    next.reset(); await new Promise<void>(resolve => setTimeout(resolve, 0)); const newReset = { value: input.value, raw: form.read() }; form.unbind();
    return { moved, oldReset, newReset, restored: input.value };
  });
  expect(result).toEqual({ moved: { value: "EDITED", raw: { name: "Edited" }, defaults: { name: "Capture" } }, oldReset: "EDITED", newReset: { value: "NATIVE", raw: { name: "Native" } }, restored: "Capture" });
});

test("pending native reset rejects rescan without flushing formatters and permits it after existing cleanup", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Native" data-format=\'[["mark"]]\'>'); let formats = 0;
    const form = h.api.bindForm(root, { rules: { format: { mark: value => { formats++; return `[${value}]`; } } } }); h.edit(h.field(root), "Edited");
    let inside: string | undefined; root.addEventListener("reset", () => { inside = h.error(() => form.rescan())?.code; }); formats = 0; root.reset();
    h.add(root, '<input data-field="note" value="Late">'); const error = h.error(() => form.rescan()), pending = { value: h.field(root).value, formats, inside };
    await new Promise<void>(resolve => setTimeout(resolve, 0)); const cleaned = { value: h.field(root).value, formats }; const retry = h.error(() => form.rescan());
    return { code: error?.code, pending, cleaned, retry: retry?.code ?? null, defaults: form.defaults() };
  });
  expect(result).toEqual({ code: "FORM_RESCAN", pending: { value: "Native", formats: 0, inside: "FORM_RESCAN" }, cleaned: { value: "[Native]", formats: 1 }, retry: null, defaults: { name: "Native", note: "Late" } });
});

test("rescan is bounded during whole value format render parse validate defaults and restoration work and recovers afterward", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery;
    return ["before", "after", "beforeValue", "afterValue", "format", "render", "parse", "validate", "defaults", "restore"].map(mode => {
      const root = h.root('<input data-field="name" value="Capture"><span data-field="note"><b>Authored</b></span>');
      const input = h.field<HTMLInputElement>(root); if (mode === "format") input.setAttribute("data-format", '[["mark"]]'); if (mode === "validate") input.setAttribute("data-validate", '[["check"]]');
      let form: FormHandle<Values> | undefined, armed = false, calls = 0, sentinel = false, nested: string | undefined;
      const attempt = () => { if (!armed) return; calls++; if (calls > 4) { sentinel = true; throw new Error("Test work recursion cap"); } armed = false; nested = h.error(() => form!.rescan())?.code; };
      form = h.api.bindForm(root, { rows: h.rows,
        ...(mode === "before" ? { beforeBind: attempt } : {}), ...(mode === "after" ? { onBind: attempt } : {}),
        ...(mode === "beforeValue" ? { beforeBindValue: () => { attempt(); } } : {}), ...(mode === "afterValue" ? { onBindValue: () => { attempt(); } } : {}),
        ...(mode === "format" ? { rules: { format: { mark: (value: string) => { attempt(); return `[${value}]`; } } } } : {}),
        ...(mode === "render" ? { render: { note: (value: unknown) => { attempt(); return String(value); } } } : {}),
        ...(mode === "parse" || mode === "defaults" ? { parse: { name: (value: string) => { attempt(); return value; } } } : {}),
        ...(mode === "validate" ? { rules: { validate: { check: () => { attempt(); return true; } } } } : {}) });
      form.bind(h.ids[0]); armed = true;
      if (mode === "parse") h.edit(input, "Candidate");
      else if (mode === "validate") form.validate();
      else if (mode === "defaults") form.defaults();
      else if (mode === "restore") {
        const native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!;
        Object.defineProperty(input, "value", { configurable: true, get() { return native.get!.call(this); }, set(value) { native.set!.call(this, value); attempt(); } });
        try { form.unbind(); } finally { delete (input as unknown as { value?: string }).value; }
      } else form.bind(h.ids[0]);
      const retry = h.error(() => form!.rescan());
      return { mode, nested, calls, sentinel, retry: retry?.code ?? null };
    });
  });
  expect(result).toEqual(["before", "after", "beforeValue", "afterValue", "format", "render", "parse", "validate", "defaults", "restore"].map(mode => ({ mode, nested: "FORM_RESCAN", calls: 1, sentinel: false, retry: null })));
});

test("native rescan reactions cannot run public work or synthetic input and Rows sets do not project during ownership changes", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture"><span data-field="note"><b>Authored</b></span>'); let hooks = 0;
    const form = h.api.bindForm(root, { rows: h.rows, beforeBind: () => { hooks++; }, onBind: () => { hooks++; }, render: { note: value => String(value) } }); form.bind(h.ids[0]);
    const note = h.field<HTMLElement>(root, "note"), input = h.field<HTMLInputElement>(root), native = Element.prototype.replaceChildren; note.removeAttribute("data-field");
    let armed = true, calls = 0, sentinel = false; const codes: (string | undefined)[] = []; hooks = 0;
    Object.defineProperty(note, "replaceChildren", { configurable: true, value: function(this: Element, ...nodes: (Node | string)[]) {
      native.apply(this, nodes); calls++; if (calls > 4) { sentinel = true; throw new Error("Test rescan reaction cap"); }
      if (armed) {
        armed = false;
        for (const action of [() => form.read(), () => form.defaults(), () => form.bind(h.ids[0]), () => form.refresh(), () => form.validate(), () => form.unbind(), () => form.rescan()]) codes.push(h.error(action)?.code);
        h.edit(input, "Synthetic"); h.rows.set(h.ids[0], "name", "Application");
      }
    } });
    try { form.rescan(); } finally { delete (note as unknown as { replaceChildren?: Element["replaceChildren"] }).replaceChildren; }
    const after = { value: input.value, source: h.rows.get(h.ids[0])!.value.name, note: note.innerHTML, hooks, raw: form.read() }; form.refresh(["name"]);
    return { codes, calls, sentinel, after, refreshed: input.value };
  });
  expect(result).toEqual({ codes: Array(7).fill("FORM_RESCAN"), calls: 1, sentinel: false,
    after: { value: "Synthetic", source: "Application", note: "<b>Authored</b>", hooks: 0, raw: { name: "Application" } }, refreshed: "Application" });
});

test("Rows removal and replacement during native retirement prune drafts and detach missing current rows without projection", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery;
    return ["remove", "replace"].map(mode => {
      const root = h.root('<input data-field="name" value="Capture" required><output data-error-for="name"></output><span data-field="note"><b>Authored</b></span>');
      const form = h.api.bindForm(root, { rows: h.rows, render: { note: value => String(value) } }), id = h.rows.entries()[0].id; form.bind(id); h.edit(h.field(root), "");
      const note = h.field<HTMLElement>(root, "note"), native = Element.prototype.replaceChildren; note.removeAttribute("data-field"); let armed = true, calls = 0, sentinel = false;
      Object.defineProperty(note, "replaceChildren", { configurable: true, value: function(this: Element, ...nodes: (Node | string)[]) {
        native.apply(this, nodes); calls++; if (calls > 4) { sentinel = true; throw new Error("Test source retirement cap"); }
        if (armed) { armed = false; if (mode === "remove") h.rows.remove(id); else h.rows.replace([{ name: "Replacement", note: "Fresh" }]); }
      } });
      let error: Failure | null = null;
      try { error = h.error(() => form.rescan()); } finally { delete (note as unknown as { replaceChildren?: Element["replaceChildren"] }).replaceChildren; }
      const refresh = h.error(() => form.refresh()), validation = form.validate();
      return { mode, code: error?.code ?? null, refresh: refresh?.code ?? null, rawUndefined: Object.values(form.read()).every(value => value === undefined),
        value: h.field(root).value, error: root.querySelector("output")!.textContent, valid: validation.valid, issues: validation.issues.length, calls, sentinel };
    });
  });
  expect(result).toEqual(["remove", "replace"].map(mode => ({ mode, code: null, refresh: null, rawUndefined: true, value: "", error: "", valid: true, issues: 0, calls: 1, sentinel: false })));
});

test("disposal from a newly captured native getter stops adoption and releases old and temporary ownership", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture" aria-describedby="help"><output data-error-for="name">Hint</output>'), form = h.api.bindForm(root);
    h.add(root, '<input data-field="count" value="7"><select data-field="choice"><option value="a">A</option></select><output data-error-for="count">Late hint</output>');
    const input = h.field<HTMLInputElement>(root, "count"), native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!; let armed = true, calls = 0, sentinel = false;
    Object.defineProperty(input, "value", { configurable: true, get() { calls++; if (calls > 4) { sentinel = true; throw new Error("Test capture getter cap"); } if (armed) { armed = false; form.dispose(); } return native.get!.call(this); }, set(value) { native.set!.call(this, value); } });
    try { h.error(() => form.rescan()); } finally { delete (input as unknown as { value?: string }).value; }
    const select = h.field<HTMLSelectElement>(root, "choice"), standalone = h.api.bindSelect(select, { choices: [] }); standalone.dispose();
    const state = { name: h.field(root).getAttribute("aria-describedby"), count: input.getAttribute("aria-describedby"), lateId: root.querySelectorAll("output")[1].getAttribute("id"),
      closed: h.error(() => form.read())?.code, sentinel, calls };
    const replacement = h.api.bindForm(root); replacement.dispose(); return state;
  });
  expect(result).toMatchObject({ name: "help", count: null, lateId: null, closed: "FORM_DISPOSED", sentinel: false }); expect(result.calls).toBeGreaterThanOrEqual(1); expect(result.calls).toBeLessThanOrEqual(4);
});

test("disposal during retirement releases newly claimed Selects before any stale ownership writes continue", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture" aria-describedby="help"><output data-error-for="name">Hint</output><span data-field="note"><b>Authored</b></span>');
    const form = h.api.bindForm(root, { render: { note: value => String(value) } }), note = h.field<HTMLElement>(root, "note"), native = Element.prototype.replaceChildren;
    note.removeAttribute("data-field"); h.add(root, '<select data-field="choice"><option value="a">A</option></select><output data-error-for="choice">Choice hint</output>');
    let armed = true, calls = 0, sentinel = false;
    Object.defineProperty(note, "replaceChildren", { configurable: true, value: function(this: Element, ...nodes: (Node | string)[]) {
      native.apply(this, nodes); calls++; if (calls > 4) { sentinel = true; throw new Error("Test disposal retirement cap"); } if (armed) { armed = false; form.dispose(); }
    } });
    try { h.error(() => form.rescan()); } finally { delete (note as unknown as { replaceChildren?: Element["replaceChildren"] }).replaceChildren; }
    const select = h.field<HTMLSelectElement>(root, "choice"), standalone = h.api.bindSelect(select, { choices: [] }); standalone.dispose();
    const state = { closed: h.error(() => form.rescan())?.code, name: h.field(root).getAttribute("aria-describedby"), choice: select.getAttribute("aria-describedby"),
      outputId: root.querySelectorAll("output")[1].getAttribute("id"), sentinel, calls };
    const replacement = h.api.bindForm(root); replacement.dispose(); return state;
  });
  expect(result).toMatchObject({ closed: "FORM_DISPOSED", name: "help", choice: null, outputId: null, sentinel: false }); expect(result.calls).toBeGreaterThanOrEqual(1); expect(result.calls).toBeLessThanOrEqual(4);
});

test("an unexpected native commit failure reports its cause and permits retry without losing a retained row draft", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery;
    return ["retirement", "publication"].map(mode => {
      const root = h.root('<input data-field="name" value="Capture" required><span data-field="note"><b>Authored</b></span>');
      const form = h.api.bindForm(root, { rows: h.rows, render: { note: value => String(value) } }); form.bind(h.ids[0]); h.edit(h.field(root), ""); form.bind(h.ids[1]);
      const note = h.field<HTMLElement>(root, "note"); if (mode === "retirement") note.removeAttribute("data-field");
      h.add(root, '<select data-field="lateChoice"><option value="a">A</option></select><output data-error-for="lateChoice">Choice hint</output>');
      const select = h.field<HTMLSelectElement>(root, "lateChoice"), region = root.querySelector("output")!; let calls = 0;
      if (mode === "retirement") {
        const native = Element.prototype.replaceChildren;
        Object.defineProperty(note, "replaceChildren", { configurable: true, value: function(this: Element, ...nodes: (Node | string)[]) { native.apply(this, nodes); calls++; throw new Error("Native retirement failed"); } });
      } else {
        const native = Element.prototype.setAttribute;
        Object.defineProperty(region, "setAttribute", { configurable: true, value: function(this: Element, name: string, value: string) {
          native.call(this, name, value); if (name === "aria-live") { calls++; throw new Error("Native publication failed"); }
        } });
      }
      let error: Failure | null = null;
      try { error = h.error(() => form.rescan()); }
      finally {
        delete (note as unknown as { replaceChildren?: Element["replaceChildren"] }).replaceChildren;
        delete (region as unknown as { setAttribute?: Element["setAttribute"] }).setAttribute;
      }
      const beforeRetry = { defaults: form.defaults(), claim: h.error(() => { const standalone = h.api.bindSelect(select, { choices: [] }); standalone.dispose(); })?.code ?? null,
        root: h.error(() => h.api.bindForm(root))?.code };
      const retry = h.error(() => form.rescan()), repaired = { description: select.getAttribute("aria-describedby") === region.id && region.id !== "", live: region.getAttribute("aria-live") };
      form.bind(h.ids[0]); const retained = { value: h.field(root).value, source: h.rows.get(h.ids[0])!.value.name }; form.dispose();
      const standalone = h.api.bindSelect(select, { choices: [] }); standalone.dispose();
      return { mode, code: error?.code, cause: (error?.cause as Error | undefined)?.message, calls, beforeRetry, retry: retry?.code ?? null, repaired, retained };
    });
  });
  expect(result).toEqual(["retirement", "publication"].map(mode => ({ mode, code: "FORM_RESCAN", cause: mode === "retirement" ? "Native retirement failed" : "Native publication failed", calls: 1,
    beforeRetry: { defaults: mode === "retirement" ? { name: "Capture" } : { name: "Capture", lateChoice: "a" }, claim: mode === "retirement" ? null : "SELECT_OWNED", root: "FORM_IN_USE" },
    retry: null, repaired: { description: true, live: "polite" }, retained: { value: "", source: "Ada" } })));
});

test("repeated release and readoption keep unique error identities and disposal makes the root reusable", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input data-field="name" value="Capture"><output data-error-for="name">Hint</output>'), otherRoot = h.root('<input data-field="name"><output data-error-for="name"></output>');
    const form = h.api.bindForm(root), other = h.api.bindForm(otherRoot), input = h.field<HTMLInputElement>(root), region = root.querySelector("output")!, ids: string[] = [otherRoot.querySelector("output")!.id];
    for (let index = 0; index < 3; index++) {
      ids.push(region.id); input.removeAttribute("data-field"); form.rescan(); input.value = `Capture ${index}`; input.setAttribute("data-field", "name"); form.rescan(); form.rescan();
    }
    ids.push(region.id); const active = { defaults: form.defaults(), rootOwned: h.error(() => h.api.bindForm(root))?.code,
      unique: new Set(ids).size === ids.length, described: input.getAttribute("aria-describedby") === region.id };
    form.dispose(); form.dispose(); other.dispose(); const closed = h.error(() => form.rescan())?.code;
    const replacement = h.api.bindForm(root), reused = replacement.defaults(); replacement.dispose();
    return { active, closed, reused, restored: { id: region.getAttribute("id"), live: region.getAttribute("aria-live"), text: region.textContent, described: input.getAttribute("aria-describedby") } };
  });
  expect(result).toEqual({ active: { defaults: { name: "Capture 2" }, rootOwned: "FORM_IN_USE", unique: true, described: true }, closed: "FORM_DISPOSED", reused: { name: "Capture 2" },
    restored: { id: null, live: null, text: "Hint", described: null } });
});

test("rescan clears obsolete errors after native publication removes the current row", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery, root = h.root('<input type="radio" name="choice" data-field="choice" value="a" required>' +
      '<input type="radio" name="choice" data-field="choice" value="b"><output data-error-for="choice"></output><input data-field="name" value="Capture">');
    const id = h.ids[0]; h.rows.set(id, "choice", null); let hooks = 0;
    const form = h.api.bindForm(root, { rows: h.rows, beforeBind: () => { hooks++; }, onBind: () => { hooks++; } }); form.bind(id);
    const validation = form.validate(), members = [...root.querySelectorAll<HTMLInputElement>('[data-field="choice"]')], region = root.querySelector("output")!;
    const known = { invalid: members.map(input => input.getAttribute("aria-invalid")), error: region.textContent, valid: validation.valid }, original = h.rows.original(id);
    h.add(root, '<input data-field="count" value="7">'); const native = Element.prototype.setAttribute; let armed = true, calls = 0, sentinel = false; hooks = 0;
    Object.defineProperty(members[0], "setAttribute", { configurable: true, value: function(this: Element, name: string, value: string) {
      native.call(this, name, value);
      if (name === "aria-invalid" && value === "true") {
        calls++; if (calls > 4) { sentinel = true; throw new Error("Test rescan ARIA removal cap"); }
        if (armed) { armed = false; h.rows.remove(id); }
      }
    } });
    let error: Failure | null = null;
    try { error = h.error(() => form.rescan()); } finally { delete (members[0] as unknown as { setAttribute?: Element["setAttribute"] }).setAttribute; }
    return { known, code: error?.code ?? null, calls, sentinel, invalid: members.map(input => input.getAttribute("aria-invalid")), error: region.textContent,
      detached: Object.values(form.read()).every(value => value === undefined), status: h.rows.get(id)?.status,
      originalPreserved: h.rows.original(id) === original, remaining: h.rows.entries().length, hooks,
      name: h.field(root).value, count: h.field(root, "count").value };
  });
  const { known, ...after } = result;
  expect(known.invalid).toEqual(["true", "true"]); expect(known.error).not.toBe(""); expect(known.valid).toBe(false);
  expect(after).toEqual({ code: null, calls: 1, sentinel: false, invalid: [null, null], error: "", detached: true,
    status: "delete", originalPreserved: true, remaining: 1, hooks: 0, name: "Ada", count: "7" });
});

test("known local display issues block retirement until explicit validation resolves them", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.formDiscovery;
    return ["plain", "formatted", "rendered"].map(mode => {
      const root = h.root('<span data-field="note" data-validate=\'[["check"]]\'' + (mode === "formatted" ? ' data-format=\'[["upper"]]\'' : "") +
        '><b>bad</b></span><output data-error-for="note">Authored hint</output><input data-field="name" value="Capture">');
      const note = h.field<HTMLElement>(root, "note"), authored = note.firstChild; let accepted = false, validations = 0;
      const form = h.api.bindForm(root, { rules: { validate: { check: () => { validations++; return accepted || "Known display issue"; } } },
        ...(mode === "rendered" ? { render: { note: (value: unknown) => `shown:${value}` } } : {}) });
      const initial = form.validate(); note.removeAttribute("data-field"); const before = root.innerHTML, error = h.error(() => form.rescan());
      const retained = { raw: form.read(), defaults: form.defaults(), message: root.querySelector("output")!.textContent,
        invalid: note.getAttribute("aria-invalid"), validations, unchanged: before === root.innerHTML };
      accepted = true; const resolved = form.validate(), retry = h.error(() => form.rescan()); h.edit(h.field(root), "Later"); form.unbind();
      return { mode, initiallyInvalid: !initial.valid, code: error?.code, field: error?.detail?.field, retained,
        resolved: resolved.valid, retry: retry?.code ?? null, validations, raw: form.read(), defaults: form.defaults(), exact: note.firstChild === authored,
        invalid: note.getAttribute("aria-invalid"), described: note.getAttribute("aria-describedby"), region: root.querySelector("output")!.outerHTML };
    });
  });
  expect(result).toEqual(["plain", "formatted", "rendered"].map(mode => ({ mode, initiallyInvalid: true, code: "FORM_RESCAN", field: "note",
    retained: { raw: { note: "bad", name: "Capture" }, defaults: { name: "Capture" }, message: "Known display issue", invalid: "true", validations: 1, unchanged: true },
    resolved: true, retry: null, validations: 2, raw: { name: "Capture" }, defaults: { name: "Capture" }, exact: true, invalid: null, described: null,
    region: '<output data-error-for="note">Authored hint</output>' })));
});

test("reset listener commit failures preserve retry and disposal ownership", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.formDiscovery, results = [];
    for (const mode of ["remove-before", "add-before", "add-dispose-after", "add-dispose-before"]) {
      const root = document.createElement("div"); root.innerHTML = '<form><input data-field="name" value="Native" data-format=\'[["mark"]]\'></form><form></form>'; document.body.append(root);
      const [old, next] = [...root.querySelectorAll("form")], input = h.field<HTMLInputElement>(root); input.value = "Capture";
      const add = EventTarget.prototype.addEventListener, remove = EventTarget.prototype.removeEventListener;
      const listeners = new Map<HTMLFormElement, Set<EventListenerOrEventListenerObject>>([[old, new Set()], [next, new Set()]]);
      let form: FormHandle<Values> | undefined, armed = false, operations = 0, sentinel = false, formats = 0;
      const count = () => { operations++; if (operations > 16) { sentinel = true; throw new Error("Test native reset listener cap"); } };
      for (const owner of [old, next]) {
        Object.defineProperty(owner, "addEventListener", { configurable: true, value: function(this: HTMLFormElement, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
          if (type !== "reset") { add.call(this, type, listener, options); return; }
          count();
          if (this === next && armed && mode !== "remove-before") {
            armed = false;
            if (mode === "add-before") throw new Error("Native reset addition failed");
            if (mode === "add-dispose-before") form!.dispose();
            add.call(this, type, listener, options); if (listener) listeners.get(this)!.add(listener);
            if (mode === "add-dispose-after") form!.dispose();
            throw new Error("Native reset registration interrupted");
          }
          add.call(this, type, listener, options); if (listener) listeners.get(this)!.add(listener);
        } });
        Object.defineProperty(owner, "removeEventListener", { configurable: true, value: function(this: HTMLFormElement, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) {
          if (type !== "reset") { remove.call(this, type, listener, options); return; }
          count();
          if (this === old && armed && mode === "remove-before") { armed = false; throw new Error("Native reset removal failed"); }
          remove.call(this, type, listener, options); if (listener) listeners.get(this)!.delete(listener);
        } });
      }
      try {
        form = h.api.bindForm(root, { rules: { format: { mark: value => { formats++; return `[${value}]`; } } } });
        next.append(input); formats = 0; armed = true; const error = h.error(() => form!.rescan());
        if (mode === "remove-before" || mode === "add-before") {
          const retry = h.error(() => form!.rescan()), registered = [listeners.get(old)!.size, listeners.get(next)!.size];
          old.reset(); await new Promise<void>(resolve => setTimeout(resolve, 0)); const oldFormats = formats;
          next.reset(); await new Promise<void>(resolve => setTimeout(resolve, 0)); const newFormats = formats - oldFormats, value = input.value;
          form.dispose();
          results.push({ mode, code: error?.code ?? null, retry: retry?.code ?? null, registered, oldFormats, newFormats, value,
            balance: listeners.get(old)!.size + listeners.get(next)!.size, closed: h.error(() => form!.read())?.code, sentinel });
        } else {
          const balance = listeners.get(old)!.size + listeners.get(next)!.size; old.reset(); next.reset(); await new Promise<void>(resolve => setTimeout(resolve, 0));
          results.push({ mode, code: error?.code ?? null, balance, formats, closed: h.error(() => form!.read())?.code, sentinel });
        }
      } finally {
        form?.dispose();
        for (const [owner, active] of listeners) {
          for (const listener of active) remove.call(owner, "reset", listener);
          delete (owner as unknown as { addEventListener?: EventTarget["addEventListener"] }).addEventListener;
          delete (owner as unknown as { removeEventListener?: EventTarget["removeEventListener"] }).removeEventListener;
        }
      }
    }
    return results;
  });
  expect(result).toEqual([
    ...["remove-before", "add-before"].map(mode => ({ mode, code: "FORM_RESCAN", retry: null, registered: [0, 1], oldFormats: 0, newFormats: 1, value: "[Native]", balance: 0, closed: "FORM_DISPOSED", sentinel: false })),
    ...["add-dispose-after", "add-dispose-before"].map(mode => ({ mode, code: null, balance: 0, formats: 0, closed: "FORM_DISPOSED", sentinel: false }))
  ]);
});

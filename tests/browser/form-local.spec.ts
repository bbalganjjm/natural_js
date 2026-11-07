// SPDX-License-Identifier: Apache-2.0
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { createRows } from "../../src/data/index.js";
import type { FormHandle } from "../../src/ui/index.js";
import type { bindForm } from "../../src/ui/form.js";
import type { bindSelect } from "../../src/ui/select.js";

type FormOptions = NonNullable<Parameters<typeof bindForm>[1]>;
type LocalOwner = { root: HTMLFormElement; form: FormHandle<Record<string, unknown>> };

declare global {
  interface Window {
    localForm: {
      api: { bindForm: typeof bindForm; bindSelect: typeof bindSelect; createRows: typeof createRows };
      root(html: string): HTMLFormElement;
      make(html: string, options?: FormOptions): LocalOwner;
      input(root: ParentNode, field?: string): HTMLInputElement;
      edit(input: HTMLInputElement | HTMLTextAreaElement, value: string): void;
      error(action: () => void): { code: string; cause?: unknown } | null;
      fileOwner?: LocalOwner;
    };
  }
}

const source = (file: string) => `/@fs/${fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/")}`;
const modules = { ui: source("../../src/ui/index.ts"), data: source("../../src/data/index.ts") };

test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async modules => {
    const [{ bindForm, bindSelect }, { createRows }] = await Promise.all([import(modules.ui), import(modules.data)]);
    const h: Window["localForm"] = {
      api: { bindForm, bindSelect, createRows },
      root(html) { const root = document.createElement("form"); root.innerHTML = html; document.body.append(root); return root; },
      make(html, options = {}) { const root = h.root(html); return { root, form: bindForm(root, options) }; },
      input: (root, field = "amount") => root.querySelector<HTMLInputElement>(`input[data-field="${field}"]`)!,
      edit(input, value) { input.value = value; input.dispatchEvent(new Event("input", { bubbles: true })); },
      error(action) { try { action(); return null; } catch (cause) { return cause as { code: string; cause?: unknown }; } }
    };
    window.localForm = h;
  }, modules);
});

test("local compiled formats display authored raw values without becoming read or rule input", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm, contexts: unknown[] = [];
    const owner = h.make('<input data-field="pay.amount" value="1200" data-format=\'[["commas"]]\'>' +
      '<textarea data-field="note" data-format=\'[["upper"]]\'>hello</textarea>' +
      '<span data-field="code" data-format=\'[["label"]]\'><b>raw</b></span>', {
      rules: { format: { label: (value, _args, context) => {
        contexts.push([value, context.rowId, context.values.pay, context.element?.dataset.field]); return `[${value}]`;
      } } }
    });
    const first = owner.form.read(), second = owner.form.read();
    return { displayed: [h.input(owner.root, "pay.amount").value, owner.root.querySelector("textarea")!.value,
      owner.root.querySelector("span")!.textContent], first, contexts,
      detached: first !== second && first.pay !== second.pay, valid: owner.form.validate().valid };
  });
  expect(result).toEqual({ displayed: ["1,200", "HELLO", "[raw]"], first: { pay: { amount: "1200" }, note: "hello", code: "raw" },
    contexts: [["raw", null, { amount: "1200" }, "code"]], detached: true, valid: true });
});

test("typed local declarations override their HTML kind and retain own named formatter functions", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm;
    const owner = h.make('<input data-field="name" value="Ada" data-format=\'[["lower"]]\'>' +
      '<span data-field="toString">raw</span>', {
      rules: { fields: { name: { format: [["upper"]] }, toString: { format: [["toString"]] } },
        format: { toString: value => `${value}!` } }
    });
    owner.form.bind(null);
    return { display: [h.input(owner.root, "name").value, owner.root.querySelector("span")!.textContent], raw: owner.form.read() };
  });
  expect(result).toEqual({ display: ["ADA", "raw!"], raw: { name: "Ada", toString: "raw" } });
});

test("local property writes remain observable without events and an explicit event can enter the previous projection", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm, owner = h.make('<input data-field="amount" value="12" data-format=\'[["suffix"]]\'>', {
      rules: { format: { suffix: value => `${value}!` } }
    });
    const input = h.input(owner.root), initial = owner.form.read();
    input.value = "34";
    const written = owner.form.read(); owner.form.bind(null);
    const refreshed = input.value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const enteredProjection = owner.form.read();
    owner.form.bind(null);
    let mutate = false, native: HTMLInputElement | undefined;
    const later: string[] = [];
    const stale = h.make('<input data-field="amount" value="12" data-format=\'[["mutate"]]\'><span data-field="summary">raw</span>', {
      rules: { format: { mutate: value => { if (mutate) native!.value = "56"; return `${value}!`; } } },
      render: { summary: (value, context) => { later.push(String(context.values.amount)); return `${value}:${context.values.amount}`; } }
    });
    native = h.input(stale.root); later.length = 0; mutate = true; stale.form.bind(null);
    return { initial, written, refreshed, enteredProjection, final: input.value,
      stale: { raw: stale.form.read(), value: native.value, summary: stale.root.querySelector("span")!.textContent, later } };
  });
  expect(result).toEqual({ initial: { amount: "12" }, written: { amount: "34" }, refreshed: "34!",
    enteredProjection: { amount: "34!" }, final: "34!!",
    stale: { raw: { amount: "56", summary: "raw" }, value: "56", summary: "raw:12", later: [] } });
});

test("local parsers affect validation candidates while reads and dependent rendering retain entered strings", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm, seen: unknown[] = [];
    const owner = h.make('<input data-field="amount" value="12" data-format=\'[["commas"]]\'>' +
      '<input data-field="peer" value="12" data-validate=\'[["same"]]\'><span data-field="summary">raw</span>', {
      parse: { amount: text => Number(text) },
      rules: { validate: { same: (value, _args, context) => {
        seen.push([value, context.values.amount, typeof context.values.amount, context.rowId]); return Number(value) === context.values.amount;
      } } },
      render: { summary: (value, context) => `${value}:${typeof context.values.amount}:${context.values.amount}` }
    });
    const initial = owner.root.querySelector("span")!.textContent;
    const valid = owner.form.validate().valid;
    h.edit(h.input(owner.root), "24"); h.edit(h.input(owner.root, "peer"), "24");
    return { initial, valid, final: owner.root.querySelector("span")!.textContent, raw: owner.form.read(),
      candidates: seen.every(value => Array.isArray(value) && value[2] === "number" && value[3] === null) };
  });
  expect(result).toEqual({ initial: "raw:string:12", valid: true, final: "raw:string:24",
    raw: { amount: "24", peer: "24", summary: "raw" }, candidates: true });
});

test("formatted local native checks use raw text and preserve custom validity and effective disabled state", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm;
    const owner = h.make('<input data-field="short" value="x" minlength="3" data-format=\'[["pad"]]\'>' +
      '<input data-field="digits" value="1234" pattern="[0-9]+" data-format=\'[["commas"]]\'>' +
      '<fieldset disabled><legend><input data-field="legend" value="x" minlength="3" data-format=\'[["pad"]]\'></legend>' +
      '<input data-field="disabled" value="x" minlength="3" data-format=\'[["pad"]]\'></fieldset>', {
      rules: { format: { pad: value => `${value}xxx` } }
    });
    const first = owner.form.validate().issues.map(issue => issue.field).sort();
    const digits = h.input(owner.root, "digits"); digits.setCustomValidity("Application native error");
    const custom = owner.form.validate().issues.filter(issue => issue.field === "digits").map(issue => issue.message);
    digits.setCustomValidity("");
    return { display: [h.input(owner.root, "short").value, digits.value], first, custom,
      final: owner.form.validate().issues.map(issue => issue.field).sort(), raw: owner.form.read() };
  });
  expect(result).toEqual({ display: ["xxxx", "1,234"], first: ["legend", "short"], custom: ["Application native error"],
    final: ["legend", "short"], raw: { short: "x", digits: "1234", legend: "x", disabled: "x" } });
});

test("local focus reveals raw and retains entered text and caret through dependent updates", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm;
    const owner = h.make('<input data-field="amount" value="123456" data-format=\'[["money"]]\'><input data-field="note" value="A">', {
      rules: { format: { money: value => `$${value}` } }
    });
    const input = h.input(owner.root); input.setSelectionRange(0, 0); input.focus();
    const focused = [input.value, input.selectionStart, input.selectionEnd];
    h.edit(input, "654321"); input.setSelectionRange(2, 4);
    h.edit(h.input(owner.root, "note"), "B");
    const retained = [input.value, input.selectionStart, input.selectionEnd, document.activeElement === input];
    input.blur();
    return { focused, retained, blurred: input.value, raw: owner.form.read() };
  });
  expect(result).toEqual({ focused: ["123456", 0, 6], retained: ["654321", 2, 4, true],
    blurred: "$654321", raw: { amount: "654321", note: "B" } });
});

test("pointer focus preserves the clicked selection while readonly local text remains formatted", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm;
    const owner = h.make('<input data-field="amount" value="123456" data-format=\'[["commas"]]\'>' +
      '<input readonly data-field="readonly" value="Ada" data-format=\'[["upper"]]\'>');
    const input = h.input(owner.root); input.setSelectionRange(2, 2);
    let nativeSelection: (number | null)[] = [];
    owner.root.addEventListener("focusin", () => { nativeSelection = [input.selectionStart, input.selectionEnd]; }, { capture: true, once: true });
    input.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); input.focus();
    input.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    const pointed = [input.value, input.selectionStart, input.selectionEnd];
    const readonly = h.input(owner.root, "readonly"); readonly.focus();
    const focused = readonly.value; readonly.blur();
    return { nativeSelection, pointed, focused, blurred: readonly.value, raw: owner.form.read() };
  });
  expect(result.pointed).toEqual(["123456", ...result.nativeSelection.map(position => position === null ? null : Math.min(position, 6))]);
  expect(result.focused).toBe("ADA");
  expect(result.blurred).toBe("ADA");
  expect(result.raw).toEqual({ amount: "123456", readonly: "Ada" });
});

test("invalid local edits remain visible through blur and valid replacements format without changing raw", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm;
    const owner = h.make('<input data-field="amount" value="12" pattern="[0-9]+" data-format=\'[["suffix"]]\'>' +
      '<output data-error-for="amount"></output>', { rules: { format: { suffix: value => `${value}!` } } });
    const input = h.input(owner.root); input.focus(); h.edit(input, "bad"); input.blur();
    const invalid = { text: input.value, raw: owner.form.read(), invalid: input.getAttribute("aria-invalid"), valid: owner.form.validate().valid };
    input.focus(); h.edit(input, "34"); input.blur();
    const valid = { text: input.value, raw: owner.form.read(), checked: owner.form.validate().valid,
      error: owner.root.querySelector("output")!.textContent };
    h.edit(input, "bad"); input.value = "56"; owner.form.bind(null);
    return { invalid, valid, programmatic: { text: input.value, raw: owner.form.read(), error: owner.root.querySelector("output")!.textContent } };
  });
  expect(result).toEqual({ invalid: { text: "bad", raw: { amount: "bad" }, invalid: "true", valid: false },
    valid: { text: "34!", raw: { amount: "34" }, checked: true, error: "" },
    programmatic: { text: "56!", raw: { amount: "56" }, error: "" } });
});

test("local autoValidate false formats entered raw but explicit validation still checks that raw", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm;
    const owner = h.make('<input data-field="amount" value="12" minlength="3" data-format=\'[["pad"]]\'>', {
      autoValidate: false, rules: { format: { pad: value => `${value}000` } }
    });
    const input = h.input(owner.root); h.edit(input, "x");
    const automatic = { value: input.value, invalid: input.getAttribute("aria-invalid"), raw: owner.form.read() };
    const checked = owner.form.validate();
    return { automatic, valid: checked.valid, rules: checked.issues.map(issue => issue.rule) };
  });
  expect(result).toEqual({ automatic: { value: "x000", invalid: null, raw: { amount: "x" } }, valid: false, rules: ["html"] });
});

test("local bind null refreshes static formats and dependent renderers from retained raw", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm, contexts: unknown[] = [];
    const owner = h.make('<input data-field="name" value="Ada"><span data-field="formatted" data-format=\'[["upper"]]\'><b>raw</b></span>' +
      '<span data-field="summary"><i>Summary</i></span>', { render: { summary: (value, context) => {
        contexts.push([value, context.values.formatted, context.rowId]); return `${value}:${context.values.name}`;
      } } });
    h.input(owner.root, "name").value = "Grace"; owner.form.bind(null);
    const display = [...owner.root.querySelectorAll("span")].map(element => element.textContent);
    const raw = owner.form.read(); owner.form.dispose();
    return { display, raw, contexts, restored: [...owner.root.querySelectorAll("span")].map(element => element.innerHTML) };
  });
  expect(result).toEqual({ display: ["RAW", "Summary:Grace"], raw: { name: "Grace", formatted: "raw", summary: "Summary" },
    contexts: [["Summary", "raw", null], ["Summary", "raw", null]], restored: ["<b>raw</b>", "<i>Summary</i>"] });
});

test("native reset restores current native defaults and group choices before local refresh", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.localForm;
    const owner = h.make('<input data-field="amount" value="12" data-format=\'[["commas"]]\'>' +
      '<input data-field="enabled" type="checkbox" checked>' +
      '<input data-field="radio" type="radio" name="local-reset-radio" value="a" checked><input data-field="radio" type="radio" name="local-reset-radio" value="b">' +
      '<select data-field="choice"><option value="a" selected>A</option><option value="b">B</option></select>' +
      '<select data-field="multiple" multiple><option value="a" selected>A</option><option value="b">B</option></select>' +
      '<span data-field="summary" data-format=\'[["summary"]]\' data-validate=\'[["static"]]\'><b>raw</b></span><output data-error-for="summary"></output>', {
      rules: { format: { summary: (value, _args, context) => `${value}:${context.values.amount}` }, validate: { static: () => "Static issue" } }
    });
    const amount = h.input(owner.root); amount.defaultValue = "2400"; h.edit(amount, "5000");
    h.input(owner.root, "enabled").checked = false;
    const radios = owner.root.querySelectorAll<HTMLInputElement>('[data-field="radio"]'); radios[1].checked = true;
    const choice = owner.root.querySelector<HTMLSelectElement>('[data-field="choice"]')!; choice.value = "b";
    const multiple = owner.root.querySelector<HTMLSelectElement>('[data-field="multiple"]')!;
    multiple.options[0].selected = false; multiple.options[1].selected = true;
    owner.form.validate();
    const summary = owner.root.querySelector<HTMLElement>('[data-field="summary"]')!;
    const before = { error: owner.root.querySelector("output")!.textContent, invalid: summary.getAttribute("aria-invalid") };
    owner.root.reset(); await Promise.resolve();
    return { before, raw: owner.form.read(), display: [amount.value, summary.textContent],
      error: owner.root.querySelector("output")!.textContent, invalid: summary.getAttribute("aria-invalid") };
  });
  expect(result.before).toEqual({ error: "Static issue", invalid: "true" });
  expect(result.raw).toEqual({ amount: "2400", enabled: true, radio: "a", choice: "a", multiple: ["a"], summary: "raw" });
  expect(result.display).toEqual(["2,400", "raw:2400"]);
  expect(result.error).toBe("");
  expect(result.invalid).not.toBe("true");
});

test("a native reset button refreshes formatted defaults without a later Form call", async ({ page }) => {
  await page.evaluate(() => {
    const h = window.localForm;
    h.fileOwner = h.make('<input data-field="amount" value="1200" data-format=\'[["commas"]]\'><button type="reset">Restore defaults</button>');
    h.fileOwner.root.dataset.localResetButton = ""; h.edit(h.input(h.fileOwner.root), "2400");
  });
  const root = page.locator("[data-local-reset-button]");
  await expect(root.locator("input")).toHaveValue("2,400");
  await root.locator('button[type="reset"]').click();
  await expect(root.locator("input")).toHaveValue("1,200");
  expect(await page.evaluate(() => window.localForm.fileOwner!.form.read())).toEqual({ amount: "1200" });
  await page.evaluate(() => {
    const h = window.localForm;
    h.fileOwner = h.make('<span data-field="summary" data-format=\'[["upper"]]\' data-validate=\'[["static"]]\'><b>raw</b></span>' +
      '<output data-error-for="summary"></output><button type="reset">Restore display</button>', { rules: { validate: { static: () => "Static issue" } } });
    h.fileOwner.root.dataset.localStaticReset = ""; h.fileOwner.form.validate();
  });
  const displayOnly = page.locator("[data-local-static-reset]");
  await expect(displayOnly.locator("output")).toHaveText("Static issue");
  await displayOnly.locator('button[type="reset"]').click();
  await expect(displayOnly.locator("output")).toHaveText("");
  await expect(displayOnly.locator("span")).toHaveText("RAW");
  expect(await page.evaluate(() => window.localForm.fileOwner!.form.read())).toEqual({ summary: "raw" });
});

test("synthetic reset follows native behavior while canceled native reset preserves raw and errors", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.localForm;
    const owner = h.make('<input data-field="amount" value="12" required data-format=\'[["commas"]]\'><output data-error-for="amount"></output>');
    h.edit(h.input(owner.root), "2400");
    const bare = h.root('<input data-field="amount" value="12" required data-format=\'[["commas"]]\'><output data-error-for="amount"></output>');
    h.input(bare).value = "2400";
    const bareEvent = new Event("reset", { bubbles: true, cancelable: true });
    const boundEvent = new Event("reset", { bubbles: true, cancelable: true });
    bare.dispatchEvent(bareEvent); owner.root.dispatchEvent(boundEvent); await Promise.resolve();
    const synthetic = { raw: owner.form.read(), value: h.input(owner.root).value,
      nativeRaw: h.input(bare).value, trusted: [bareEvent.isTrusted, boundEvent.isTrusted] };
    h.edit(h.input(owner.root), ""); owner.form.validate();
    const before = { raw: owner.form.read(), error: owner.root.querySelector("output")!.textContent };
    owner.root.addEventListener("reset", event => event.preventDefault()); owner.root.reset(); await Promise.resolve();
    let nested: LocalOwner | undefined, resetDuringFormat = false;
    nested = h.make('<input data-field="amount" value="12" data-format=\'[["reset"]]\'>', {
      rules: { format: { reset: value => {
        if (resetDuringFormat) { resetDuringFormat = false; nested!.root.reset(); }
        return `${value}!`;
      } } }
    });
    nested.root.addEventListener("reset", event => event.preventDefault());
    h.input(nested.root).value = "34"; resetDuringFormat = true; nested.form.bind(null);
    const nestedCommit = { raw: nested.form.read(), value: h.input(nested.root).value };
    return { synthetic, before, after: { raw: owner.form.read(), error: owner.root.querySelector("output")!.textContent },
      invalid: h.input(owner.root).getAttribute("aria-invalid"), nestedCommit };
  });
  expect(result.synthetic.nativeRaw).toMatch(/^(12|2400)$/);
  expect(result.synthetic.trusted).toEqual([false, false]);
  expect(result.synthetic.raw).toEqual({ amount: result.synthetic.nativeRaw });
  expect(result.synthetic.value).toBe(result.synthetic.nativeRaw === "12" ? "12" : "2,400");
  expect(result.before.raw).toEqual({ amount: "" });
  expect(result.before.error).not.toBe("");
  expect(result.after).toEqual(result.before);
  expect(result.invalid).toBe("true");
  expect(result.nestedCommit).toEqual({ raw: { amount: "34" }, value: "34!" });
});

test("a local div observes its ancestor native form reset and refreshes dependent display", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.localForm, native = h.root('<div data-local-root><input data-field="amount" value="1200" data-format=\'[["commas"]]\'>' +
      '<span data-field="summary">raw</span></div>');
    const root = native.querySelector<HTMLElement>("[data-local-root]")!;
    const form = h.api.bindForm(root, { render: { summary: (value, context) => `${value}:${context.values.amount}` } });
    h.edit(h.input(root), "2400"); const before = root.querySelector("span")!.textContent;
    native.reset(); await new Promise<void>(resolve => setTimeout(resolve, 0));
    return { before, display: [h.input(root).value, root.querySelector("span")!.textContent], raw: form.read() };
  });
  expect(result).toEqual({ before: "raw:2400", display: ["1,200", "raw:1200"], raw: { amount: "1200", summary: "raw" } });
});

test("external native form owners reset only their own raw and errors and preserve another owner focus", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.localForm;
    const left = h.root(""); left.id = "local-left-owner"; const right = h.root(""); right.id = "local-right-owner";
    const root = document.createElement("div"); root.innerHTML =
      '<input form="local-left-owner" data-field="left" value="1200" required data-format=\'[["commas"]]\'><output data-error-for="left"></output>' +
      '<input form="local-right-owner" data-field="right" value="2400" required data-format=\'[["commas"]]\'><output data-error-for="right"></output>';
    document.body.append(root); const form = h.api.bindForm(root);
    const leftInput = h.input(root, "left"), rightInput = h.input(root, "right");
    h.edit(leftInput, ""); h.edit(rightInput, ""); form.validate(); rightInput.focus(); rightInput.setSelectionRange(0, 0);
    const rightError = root.querySelector('[data-error-for="right"]')!.textContent;
    left.reset(); await Promise.resolve();
    return { raw: form.read(), display: [leftInput.value, rightInput.value], leftInvalid: leftInput.getAttribute("aria-invalid"),
      rightInvalid: rightInput.getAttribute("aria-invalid"), rightError, retainedError: root.querySelector('[data-error-for="right"]')!.textContent,
      focused: document.activeElement === rightInput, selection: [rightInput.selectionStart, rightInput.selectionEnd] };
  });
  expect(result.raw).toEqual({ left: "1200", right: "" });
  expect(result.display).toEqual(["1,200", ""]);
  expect(result.leftInvalid).not.toBe("true");
  expect(result.rightInvalid).toBe("true");
  expect(result.rightError).not.toBe("");
  expect(result.retainedError).toBe(result.rightError);
  expect(result.focused).toBe(true);
  expect(result.selection).toEqual([0, 0]);
});

test("read inside reset dispatch sees old raw and immediate read after default action sees restored raw", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.localForm, owner = h.make('<input data-field="amount" value="1200" data-format=\'[["commas"]]\'>');
    h.edit(h.input(owner.root), "2400"); let inside: unknown;
    owner.root.addEventListener("reset", () => { inside = owner.form.read(); });
    owner.root.reset(); const immediate = owner.form.read(); await Promise.resolve();
    return { inside, immediate, settled: owner.form.read(), display: h.input(owner.root).value };
  });
  expect(result).toEqual({ inside: { amount: "2400" }, immediate: { amount: "1200" }, settled: { amount: "1200" }, display: "1,200" });
});

test("explicit validation immediately after reset survives queued reset cleanup", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.localForm;
    const owner = h.make('<input data-field="amount" value="" required data-format=\'[["commas"]]\'><output data-error-for="amount"></output>');
    h.edit(h.input(owner.root), "1200"); owner.root.reset();
    const checked = owner.form.validate();
    const error = owner.root.querySelector("output")!.textContent; await Promise.resolve();
    return { valid: checked.valid, error, settled: owner.root.querySelector("output")!.textContent,
      invalid: h.input(owner.root).getAttribute("aria-invalid"), raw: owner.form.read() };
  });
  expect(result.valid).toBe(false);
  expect(result.error).not.toBe("");
  expect(result.settled).toBe(result.error);
  expect(result.invalid).toBe("true");
  expect(result.raw).toEqual({ amount: "" });
});

test("coalesced resets never adopt a written projection or erase validation performed after the reset", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.localForm;
    const owner = h.make('<input data-field="amount" value="12" minlength="3" data-format=\'[["suffix"]]\'><output data-error-for="amount"></output>', {
      rules: { format: { suffix: value => `${value}!` } }
    });
    h.edit(h.input(owner.root), "1234"); owner.root.reset(); owner.root.reset();
    const immediate = owner.form.read(); const valid = owner.form.validate().valid;
    const error = owner.root.querySelector("output")!.textContent; await Promise.resolve();
    return { immediate, settled: owner.form.read(), display: h.input(owner.root).value, valid, error,
      retained: owner.root.querySelector("output")!.textContent };
  });
  expect(result.immediate).toEqual({ amount: "12" });
  expect(result.settled).toEqual({ amount: "12" });
  expect(result.display).toBe("12!");
  expect(result.valid).toBe(false);
  expect(result.error).not.toBe("");
  expect(result.retained).toBe(result.error);
});

test("an edit after native reset takes precedence over pending reset rendering and cleanup", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.localForm;
    const owner = h.make('<input data-field="amount" value="12" pattern="[0-9]+" data-format=\'[["commas"]]\'><output data-error-for="amount"></output>');
    h.edit(h.input(owner.root), "2400"); owner.root.reset(); h.edit(h.input(owner.root), "bad");
    const error = owner.root.querySelector("output")!.textContent; await Promise.resolve();
    return { raw: owner.form.read(), display: h.input(owner.root).value, invalid: h.input(owner.root).getAttribute("aria-invalid"),
      error, settled: owner.root.querySelector("output")!.textContent };
  });
  expect(result.raw).toEqual({ amount: "bad" });
  expect(result.display).toBe("bad");
  expect(result.invalid).toBe("true");
  expect(result.error).not.toBe("");
  expect(result.settled).toBe(result.error);
});

test("formatted local siblings keep file validation on the real input and native reset clears the file", async ({ page }) => {
  await page.evaluate(() => {
    const h = window.localForm;
    h.fileOwner = h.make('<input data-field="amount" value="1200" data-format=\'[["commas"]]\'>' +
      '<input type="file" data-field="file" required data-validate=\'[["acceptFileExt","txt"]]\'><output data-error-for="file"></output>');
    h.fileOwner.root.dataset.localFile = "";
  });
  await page.locator('[data-local-file] input[type="file"]').setInputFiles({ name: "note.txt", mimeType: "text/plain", buffer: Buffer.from("raw") });
  const result = await page.evaluate(async () => {
    const h = window.localForm, owner = h.fileOwner!;
    const before = { valid: owner.form.validate().valid, raw: owner.form.read() };
    owner.root.reset(); const immediate = owner.form.read();
    const after = owner.form.validate(); await Promise.resolve();
    return { before, immediate, valid: after.valid, fields: after.issues.map(issue => issue.field),
      fileCount: h.input(owner.root, "file").files!.length, invalid: h.input(owner.root, "file").getAttribute("aria-invalid") };
  });
  expect(result).toEqual({ before: { valid: true, raw: { amount: "1200", file: "note.txt" } },
    immediate: { amount: "1200", file: "" }, valid: false, fields: ["file"], fileCount: 0, invalid: "true" });
});

test("local constructor failures restore written values exact authored children and Select ownership", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm;
    const failures = ["formatter", "renderer"].map(kind => {
      const root = h.root('<input data-field="amount" value="1200" data-format=\'[["commas"]]\'>' +
        '<span data-field="first"><b>First</b></span><span data-field="last"><i>Last</i></span>' +
        '<select data-field="choice"><option value="a" selected>A</option></select>');
      if (kind === "formatter") root.querySelector('[data-field="last"]')!.setAttribute("data-format", '[["fail"]]');
      const children = [...root.querySelectorAll("span")].map(element => element.firstChild), before = root.innerHTML;
      const error = h.error(() => h.api.bindForm(root, {
        rules: { format: { fail: () => { throw new Error("Formatter failed"); } } },
        render: { first: value => `Written ${value}`, ...(kind === "renderer" ? { last: () => { throw new Error("Renderer failed"); } } : {}) }
      }));
      const restored = root.innerHTML === before && [...root.querySelectorAll("span")].every((element, index) => element.firstChild === children[index]);
      const select = h.api.bindSelect(root.querySelector("select")!, { choices: [{ value: "a", label: "A" }] }); select.dispose();
      const retry = h.api.bindForm(root, { rules: { format: { fail: value => value } } }); retry.dispose();
      return { kind, code: error?.code, restored, raw: h.input(root).value };
    });
    const invalidTargets = [
      '<span data-field="container" data-format=\'[["upper"]]\'><input aria-label="Nested control"></span>',
      '<span data-field="container" data-format=\'[["upper"]]\'><span data-field="nested">raw</span></span>',
      '<span data-field="container" data-format=\'[["upper"]]\'><output data-error-for="container">Authored error</output></span>',
      '<span contenteditable="true" data-field="container" data-format=\'[["upper"]]\'>raw</span>',
      '<span data-error-for="container" data-field="container" data-format=\'[["upper"]]\'>Authored error</span>'
    ].map(html => {
      const root = h.root(html + '<select data-field="choice"><option value="a" selected>A</option></select>');
      const before = root.innerHTML, nodes = [root, ...root.querySelectorAll<HTMLElement>("*")];
      const children = nodes.map(element => [...element.childNodes]);
      const error = h.error(() => h.api.bindForm(root));
      const unchanged = before === root.innerHTML && nodes.every((element, index) =>
        element.childNodes.length === children[index].length && children[index].every((node, child) => element.childNodes[child] === node));
      const select = h.api.bindSelect(root.querySelector("select")!, { choices: [{ value: "a", label: "A" }] }); select.dispose();
      const target = root.querySelector('[data-field="container"]')!;
      target.removeAttribute("data-format"); target.removeAttribute("contenteditable"); target.removeAttribute("data-error-for");
      const retry = h.api.bindForm(root); retry.dispose();
      return { code: error?.code, unchanged };
    });
    return { failures, invalidTargets };
  });
  expect(result.failures).toEqual([{ kind: "formatter", code: "RULE_FAILED", restored: true, raw: "1200" },
    { kind: "renderer", code: "UI_RENDER", restored: true, raw: "1200" }]);
  expect(result.invalidTargets).toEqual(Array.from({ length: 5 }, () => ({ code: "FORM_FORMAT_CONTROL", unchanged: true })));
});

test("local disposal releases latest raw and exact display children and suppresses queued reset work", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const h = window.localForm, root = h.root('<input data-field="amount" value="1200" data-format=\'[["commas"]]\'>' +
      '<span data-field="formatted" data-format=\'[["upper"]]\'><b>raw</b></span><span data-field="summary"><i>summary</i></span>');
    const spans = [...root.querySelectorAll("span")], original = spans.map(element => element.firstChild);
    const form = h.api.bindForm(root, { render: { summary: value => `${value}!` } });
    h.edit(h.input(root), "2400"); form.dispose();
    const first = { value: h.input(root).value, restored: spans.every((element, index) => element.firstChild === original[index]) };
    const rebound = h.api.bindForm(root); root.reset(); rebound.dispose();
    const newForm = h.api.bindForm(root); h.edit(h.input(root), "3600"); await Promise.resolve();
    const final = { raw: newForm.read(), value: h.input(root).value }; newForm.dispose();
    return { first, final, disposed: h.error(() => form.read())?.code };
  });
  expect(result).toEqual({ first: { value: "2400", restored: true },
    final: { raw: { amount: "3600", formatted: "raw", summary: "summary" }, value: "3,600" }, disposed: "FORM_DISPOSED" });
});

test("recursive local formatter and renderer refresh fails without losing root ownership or retry", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm;
    return ["formatter", "renderer"].map(kind => {
      const root = h.root(kind === "formatter" ? '<input data-field="amount" value="12" data-format=\'[["recur"]]\'>' : '<span data-field="amount">12</span>');
      let form: FormHandle<Record<string, unknown>> | undefined, recursive = false;
      const write = (value: unknown) => { if (recursive) form!.bind(null); return `${value}!`; };
      form = h.api.bindForm(root, kind === "formatter" ? { rules: { format: { recur: write } } } : { render: { amount: write } });
      recursive = true; const error = h.error(() => form!.bind(null)); recursive = false; form.bind(null);
      const raw = form.read(); const code = h.error(() => h.api.bindForm(root))?.code;
      const display = kind === "formatter" ? h.input(root).value : root.textContent; form.dispose();
      return { kind, error: error?.code, raw, code, display };
    });
  });
  expect(result).toEqual([{ kind: "formatter", error: "RULE_FAILED", raw: { amount: "12" }, code: "FORM_IN_USE", display: "12!" },
    { kind: "renderer", error: "UI_RENDER", raw: { amount: "12" }, code: "FORM_IN_USE", display: "12!" }]);
});

test("a disposed local callback cannot overwrite its replacement Form or run stale later fields", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm;
    return ["formatter", "renderer"].map(kind => {
      const root = h.root((kind === "formatter" ? '<input data-field="amount" value="12" data-format=\'[["replace"]]\'>' : '<span data-field="amount"><i>12</i></span>') +
        '<span data-field="later">raw</span>');
      let form: FormHandle<Record<string, unknown>> | undefined, replacement: FormHandle<Record<string, unknown>> | undefined;
      let replace = false, later = 0;
      const write = (value: unknown) => {
        if (replace) {
          form!.dispose(); replacement = h.api.bindForm(root, kind === "formatter"
            ? { rules: { format: { replace: next => `${next}:new` } } }
            : { render: { amount: next => `${next}:new` } });
          return "stale";
        }
        return `${value}:old`;
      };
      const render = { later: (value: unknown) => { later++; return `${value}!`; } };
      form = h.api.bindForm(root, kind === "formatter" ? { rules: { format: { replace: write } }, render } : { render: { ...render, amount: write } });
      const initialLater = later; replace = true; form.bind(null);
      return { kind, value: kind === "formatter" ? h.input(root).value : root.querySelector('[data-field="amount"]')!.textContent,
        raw: replacement!.read(), later: later - initialLater, laterText: root.querySelector('[data-field="later"]')!.textContent,
        disposed: h.error(() => form!.read())?.code };
    });
  });
  expect(result).toEqual(["formatter", "renderer"].map(kind => ({ kind, value: "12:new", raw: { amount: "12", later: "raw" }, later: 0,
    laterText: "raw", disposed: "FORM_DISPOSED" })));
});

test("local image formats retain raw src and alt through direct writes disposal and failed initialization", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm, pixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const owner = h.make(`<img data-field="picture" src="${pixel}" alt="Authored description" data-format='[["image"]]'>`, {
      rules: { format: { image: value => `${value}#display` } }
    });
    const image = owner.root.querySelector("img")!;
    const initial = { raw: owner.form.read(), src: image.getAttribute("src") };
    image.setAttribute("src", `${pixel}#attribute`); const attribute = owner.form.read(); owner.form.bind(null);
    image.src = `${pixel}#property`; const property = owner.form.read(); owner.form.bind(null);
    const display = image.getAttribute("src"); owner.form.dispose();
    const restored = { src: image.getAttribute("src"), alt: image.alt };
    const rollback = [null, ""].map(src => {
      const root = h.root('<img data-field="picture" alt="Initial" data-format=\'[["image"]]\'><span data-field="last" data-format=\'[["fail"]]\'>raw</span>');
      const target = root.querySelector("img")!; if (src !== null) target.setAttribute("src", src);
      const error = h.error(() => h.api.bindForm(root, { rules: { format: { image: () => pixel, fail: () => { throw new Error("Failed"); } } } }));
      return { code: error?.code, src: target.getAttribute("src"), alt: target.alt };
    });
    return { pixel, initial, attribute, property, display, restored, rollback };
  });
  expect(result.initial).toEqual({ raw: { picture: result.pixel }, src: `${result.pixel}#display` });
  expect(result.attribute).toEqual({ picture: `${result.pixel}#attribute` });
  expect(result.property).toEqual({ picture: `${result.pixel}#property` });
  expect(result.display).toBe(`${result.pixel}#property#display`);
  expect(result.restored).toEqual({ src: `${result.pixel}#property`, alt: "Authored description" });
  expect(result.rollback).toEqual([{ code: "RULE_FAILED", src: null, alt: "Initial" }, { code: "RULE_FAILED", src: "", alt: "Initial" }]);
});

test("one-record Rows recipes retain unbound raw keys and distinguish received insert checkpoints from ordinary additions", async ({ page }) => {
  const result = await page.evaluate(() => {
    const h = window.localForm, root = h.root('<input data-field="name"><input data-field="salary" data-format=\'[["commas"]]\'>');
    const rows = h.api.createRows([{ id: "server-1", name: "Ada", salary: 1200, payload: { token: "raw" } }]);
    const form = h.api.bindForm(root, { rows }); const loaded = rows.entries()[0].id; form.bind(loaded);
    const read = form.read(), full = rows.get(loaded)!.value;
    rows.set(loaded, "salary", 2400); const changed = { display: h.input(root, "salary").value, payload: rows.changes()[0].value };
    rows.revert(loaded); const reverted = { salary: rows.get(loaded)!.value.salary, display: h.input(root, "salary").value, clean: rows.changes().length === 0 };
    const defaults = { id: "new", name: "Preset", salary: 1500, payload: { token: "default" } };
    rows.replaceState([{ value: defaults, status: "insert" }]); const checkpoint = rows.entries()[0].id; form.bind(checkpoint);
    rows.set(checkpoint, "name", "Edited"); rows.revert(checkpoint);
    const received = { value: rows.get(checkpoint)!.value, status: rows.get(checkpoint)!.status, display: h.input(root, "name").value };
    const added = rows.add(defaults); rows.revert(added);
    return { read, full, changed, reverted, received, ordinaryRemoved: rows.get(added) === undefined };
  });
  expect(result).toEqual({ read: { name: "Ada", salary: 1200 }, full: { id: "server-1", name: "Ada", salary: 1200, payload: { token: "raw" } },
    changed: { display: "2,400", payload: { id: "server-1", name: "Ada", salary: 2400, payload: { token: "raw" } } },
    reverted: { salary: 1200, display: "1,200", clean: true },
    received: { value: { id: "new", name: "Preset", salary: 1500, payload: { token: "default" } }, status: "insert", display: "Preset" },
    ordinaryRemoved: true });
});

for (const layout of ["side", "stack"] as const) {
  test(layout + " CVC local search sends raw lowercase and resets native fields without a request or changes to another page", async ({ page }) => {
    const errors: Error[] = [], searches: unknown[] = [];
    page.on("pageerror", error => errors.push(error));
    page.on("request", request => { if (request.url().includes("/api/employees/search")) searches.push(request.postDataJSON()); });
    await page.goto("/m4/" + layout + ".html");
    await page.locator('[data-action="open"]').click();
    const screens = page.locator('[data-page="employees"]');
    await expect(screens).toHaveCount(2);
    await expect(screens.nth(0).locator("tbody tr")).toHaveCount(3);
    await expect(screens.nth(1).locator("tbody tr")).toHaveCount(3);
    const first = screens.nth(0), second = screens.nth(1);
    const query = first.locator('[data-role="search"] [data-field="query"]');
    const otherQuery = second.locator('[data-role="search"] [data-field="query"]');
    await otherQuery.fill("grace"); await otherQuery.blur(); await expect(otherQuery).toHaveValue("GRACE");
    await query.fill("ada"); await query.blur(); await expect(query).toHaveValue("ADA");
    const request = page.waitForRequest(request => request.url().includes("/api/employees/search"));
    await first.locator('[data-role="search"] button[type="submit"]').click();
    expect((await request).postDataJSON()).toEqual({ query: "ada" });
    await expect(first.locator("tbody tr")).toHaveCount(1);
    await expect(first.locator("tbody tr")).toContainText("Ada");
    const beforeReset = searches.length;
    await first.locator('[data-role="search"] button[type="reset"]').click();
    await expect(query).toHaveValue("");
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
    expect(searches).toHaveLength(beforeReset);
    await expect(first.locator("tbody tr")).toHaveCount(1);
    await expect(otherQuery).toHaveValue("GRACE");
    await expect(second.locator("tbody tr")).toHaveCount(3);
    const otherRequest = page.waitForRequest(request => request.url().includes("/api/employees/search"));
    await second.locator('[data-role="search"] button[type="submit"]').click();
    expect((await otherRequest).postDataJSON()).toEqual({ query: "grace" });
    await expect(second.locator("tbody tr")).toHaveCount(1);
    await expect(second.locator("tbody tr")).toContainText("Grace");
    await expect(first.locator("tbody tr")).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}

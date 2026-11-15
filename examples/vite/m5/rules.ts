// SPDX-License-Identifier: Apache-2.0
import { createRows } from "@bbalganjjm/natural_js/data";
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageDefinition, PageHandle } from "@bbalganjjm/natural_js/page";
import { bindForm, bindGrid, bindList, createInputMask, createRules } from "@bbalganjjm/natural_js/ui";
import type { RuleSet } from "@bbalganjjm/natural_js/ui";

type RecordValue = { name: string; amount: number };
type Layout = "stack" | "compact";
function find<E extends Element>(root: ParentNode, selector: string): E {
  const element = root.querySelector<E>(selector);
  if (!element) throw new Error(`The rule example needs ${selector}.`);
  return element;
}
const template = find<HTMLTemplateElement>(document, "[data-workspace]");
const pages = new Map<Layout, PageHandle>();
const definition: PageDefinition<{ layout: Layout; close(): void }> = {
  view: () => template.content.firstElementChild!.cloneNode(true) as HTMLElement,
  controller({ root, input, signal, own }) {
    root.dataset.layout = input.layout;
    root.setAttribute("aria-label", `${input.layout} rule screen`);
    find(root, "[data-title]").textContent = `${input.layout} editor`;
    const rows = createRows<RecordValue>([{ name: "Ada", amount: 1200.5 }, { name: "Bea", amount: 2400 }]);
    own(() => rows.dispose());
    const fields: NonNullable<RuleSet["fields"]> = { name: { validate: [["required"], ["minlength", 5]] } };
    const formRoot = find<HTMLFormElement>(root, "[data-editor]");
    const form = bindForm(formRoot, { rows, rules: { fields } }); own(() => form.dispose());
    const grid = bindGrid(find<HTMLTableElement>(root, "table"), { rows, rules: { fields } }); own(() => grid.dispose());
    const list = bindList(find<HTMLUListElement>(root, "ul"), { rows, rules: { fields } }); own(() => list.dispose());
    const id = rows.entries()[0].id;
    const status = find(root, "[data-status]");
    const manual = find<HTMLInputElement>(root, "[data-manual-amount]");
    const error = find<HTMLOutputElement>(root, "[data-manual-error]");
    error.id = `manual-error-${crypto.randomUUID()}`;
    manual.setAttribute("aria-describedby", error.id);
    const partial = createInputMask({ kind: "numeric", pattern: "$#,##0.00", partial: true });
    const full = createInputMask({ kind: "numeric", pattern: "$#,##0.00" });
    let raw = "1200.5", composing = false, minimum = 5;
    let composed: { entered: string; shown: string } | undefined;
    let rules = createRules({ fields: { total: { format: [["commas"]] }, amount: { validate: [["required"], ["minvalue", 100]] } } });
    function showRecords(): void {
      find(root, "[data-total]").textContent = rules.format(rows.entries().length, { field: "total", values: {}, rowId: null });
      find(root, "[data-records]").textContent = JSON.stringify(rows.entries().map(row => row.value));
    }
    own(rows.subscribe(showRecords));
    function showAmount(finished: boolean): void {
      const masked = (finished ? full : partial).apply(manual.value);
      raw = masked.stripped; manual.value = masked.value;
      const validation = rules.validate(raw, { field: "amount", values: { amount: raw }, rowId: null });
      error.textContent = [...masked.issues.map(issue => issue.message), ...validation.issues.map(issue => issue.message)].join(" ");
      manual.setAttribute("aria-invalid", String(masked.issues.length > 0 || !validation.valid));
      find(root, "[data-manual-raw]").textContent = raw;
    }
    manual.addEventListener("beforeinput", event => {
      const input = event as InputEvent;
      if (!input.isComposing && !["insertCompositionText", "insertFromComposition"].includes(input.inputType)) composed = undefined;
    }, { signal });
    manual.addEventListener("focus", () => { composed = undefined; manual.value = raw; }, { signal });
    manual.addEventListener("input", () => {
      if (composing) return;
      const completed = composed; composed = undefined;
      if (completed && (manual.value === completed.entered || manual.value === completed.shown)) return;
      showAmount(false);
    }, { signal });
    manual.addEventListener("blur", () => { composed = undefined; if (!composing) showAmount(true); }, { signal });
    manual.addEventListener("compositionstart", () => { composed = undefined; composing = true; }, { signal });
    manual.addEventListener("compositionend", () => {
      composing = false;
      const entered = manual.value;
      showAmount(false);
      composed = { entered, shown: manual.value };
    }, { signal });
    formRoot.addEventListener("submit", event => { event.preventDefault(); report(); }, { signal });
    function report(): void {
      find(root, "[data-rule-issues]").textContent = JSON.stringify([form.validate(), grid.validate(), list.validate()].map(result =>
        ({ valid: result.valid, issues: result.issues.map(({ rowId, field, rule, message }) => ({ rowId, field, rule, message })) })));
    }
    root.addEventListener("click", event => {
      const button = (event.target as Element).closest("button"); if (!button) return;
      if (button.hasAttribute("data-close")) { input.close(); return; }
      if (button.hasAttribute("data-adopt")) {
        minimum = minimum === 5 ? 8 : 5;
        fields.name = { validate: [["required"], ["minlength", minimum]] };
        form.rescan(); grid.refresh(); list.refresh();
        rules = createRules({ fields: { total: { format: [["commas"]] }, amount: { validate: [["required"], ["minvalue", minimum * 100]] } } });
        find(root, "[data-minimum]").textContent = String(minimum);
        status.textContent = "Rules adopted. Existing inputs and issues remain until validation.";
      } else if (button.hasAttribute("data-validate-all")) report();
      else if (button.hasAttribute("data-append")) rows.add({ name: "New record", amount: 0 });
      showRecords();
    }, { signal });
    return { async init() { form.bind(id); await grid.whenBound(); manual.value = raw; showAmount(true); showRecords(); } };
  }
};
async function open(layout: Layout): Promise<void> {
  const button = find<HTMLButtonElement>(document, `[data-open="${layout}"]`); button.disabled = true;
  try {
    await pages.get(layout)?.dispose();
    const page = mountPage(find(document, `[data-host="${layout}"]`), definition, { layout, close() { void page.dispose(); } });
    pages.set(layout, page); await page.ready;
    find(document, "[data-page-status]").textContent = "Rule screens are ready.";
  } catch (cause) { find(document, "[data-page-status]").textContent = cause instanceof Error ? cause.message : String(cause); }
  finally { button.disabled = false; }
}
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-open]")) {
  button.addEventListener("click", () => { void open(button.dataset.open as Layout); });
}
await Promise.all([open("stack"), open("compact")]);

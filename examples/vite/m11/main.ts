// SPDX-License-Identifier: Apache-2.0
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageDefinition } from "@bbalganjjm/natural_js/page";
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindDatePicker, bindForm, bindTree } from "@bbalganjjm/natural_js/ui";

interface Person {
  key: string;
  parent: string | null;
  name: string;
  role: string;
  date: string;
}

interface WorkspaceInput {
  screen: number;
  close(): void;
}

function find<E extends Element>(root: ParentNode, selector: string): E {
  const element = root.querySelector<E>(selector);
  if (!element) throw new Error(`The M11 view needs ${selector}.`);
  return element;
}

const hosts = find<HTMLElement>(document, "[data-screens]");
const template = find<HTMLTemplateElement>(document, "template[data-workspace]");
const openButton = find<HTMLButtonElement>(document, "[data-add-screen]");
let nextScreen = 0;
let nextController = 0;

const workspace: PageDefinition<WorkspaceInput> = {
  view: () => template.content.firstElementChild!.cloneNode(true) as HTMLElement,
  controller({ root, input, signal, own }) {
    root.dataset.screen = String(input.screen);
    root.dataset.controller = String(++nextController);
    root.setAttribute("aria-label", `Workspace ${input.screen}`);
    find<HTMLElement>(root, "[data-workspace-title]").textContent = `Workspace ${input.screen}`;
    const rows = createRows<Person>([
      { key: "product", parent: null, name: "Product", role: "Team", date: "2026-10-01" },
      { key: "ada", parent: "product", name: "Ada", role: "Designer", date: "2026-10-05" },
      { key: "lin", parent: "product", name: "Lin", role: "Engineer", date: "2026-10-12" },
      { key: "research", parent: null, name: "Research", role: "Team", date: "2026-10-02" },
      { key: "grace", parent: "research", name: "Grace", role: "Engineer", date: "2026-11-03" }
    ]);
    own(() => rows.dispose());
    const formRoot = find<HTMLFormElement>(root, "[data-detail]");
    const form = bindForm(formRoot, { rows });
    own(() => form.dispose());
    const dateInput = find<HTMLInputElement>(formRoot, '[data-field="date"]');
    const selectedText = find<HTMLOutputElement>(root, "[data-selected]");
    const result = find<HTMLOutputElement>(root, "[data-result]");
    const dialog = find<HTMLDialogElement>(root, "[data-date-dialog]");
    const opener = find<HTMLButtonElement>(root, "[data-open-date]");
    const picker = bindDatePicker(find<HTMLElement>(dialog, "[data-datepicker]"), {
      min: "2026-01-01",
      max: "2027-12-31",
      locale: "en-US",
      weekStartsOn: 1,
      onChange(value) {
        dateInput.value = value;
        dateInput.dispatchEvent(new Event("input", { bubbles: true }));
        dateInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    own(() => picker.dispose());
    const treeRoot = find<HTMLUListElement>(root, "[data-people]");
    treeRoot.setAttribute("aria-label", `People in workspace ${input.screen}`);
    const tree = bindTree(treeRoot, {
      rows,
      key: row => row.key,
      parent: row => row.parent,
      onSelect({ id, row }) {
        form.bind(id);
        selectedText.textContent = row ? `Selected: ${row.value.name}` : "No selection";
        opener.disabled = id === null;
        picker.setValue(row?.value.date ?? null);
      }
    });
    own(() => tree.dispose());
    own(() => { if (dialog.open) dialog.close(); });
    function showChanges(): void {
      find<HTMLElement>(root, "[data-changes]").textContent = JSON.stringify(rows.changes(), null, 2);
      const row = tree.selected() === null ? undefined : rows.get(tree.selected()!);
      if (row) {
        selectedText.textContent = `Selected: ${row.value.name}`;
        if (picker.value() !== row.value.date) picker.setValue(row.value.date);
      }
    }
    return {
      init() {
        own(rows.subscribe(showChanges));
        tree.select(rows.entries().find(row => row.value.key === "ada")!.id);
        showChanges();
        opener.addEventListener("click", () => {
          opener.focus({ preventScroll: true });
          picker.setValue(picker.value());
          dialog.showModal();
          picker.focus();
        }, { signal });
        dialog.addEventListener("close", () => {
          if (!signal.aborted && opener.isConnected) opener.focus({ preventScroll: true });
        }, { signal });
        dialog.addEventListener("click", event => {
          const choice = event.target instanceof Element
            ? event.target.closest<HTMLButtonElement>("[data-date-value], [data-date-today]") : null;
          if (choice instanceof HTMLButtonElement && !choice.disabled) {
            queueMicrotask(() => { if (!signal.aborted) dialog.close(); });
          }
        }, { signal, capture: true });
        find<HTMLButtonElement>(dialog, "[data-close-date]")
          .addEventListener("click", () => dialog.close(), { signal });
        formRoot.addEventListener("submit", event => {
          event.preventDefault();
          result.textContent = form.validate().valid ? "Valid changes ready to save" : "Check the marked fields";
        }, { signal });
        find<HTMLButtonElement>(root, "[data-revert]").addEventListener("click", () => {
          rows.revert();
          result.textContent = "Changes reverted";
        }, { signal });
        find<HTMLButtonElement>(root, "[data-remove-screen]")
          .addEventListener("click", input.close, { signal });
      },
      activate() { root.dataset.lifecycle = "active"; },
      deactivate() { root.dataset.lifecycle = "inactive"; }
    };
  }
};

function openWorkspace(): void {
  const host = document.createElement("div");
  hosts.append(host);
  const page = mountPage(host, workspace, {
    screen: ++nextScreen,
    close() {
      window.removeEventListener("pagehide", onPageHide);
      void page.dispose().finally(() => {
        host.remove();
        openButton.focus({ preventScroll: true });
      });
    }
  });
  const onPageHide = () => { void page.dispose(); };
  window.addEventListener("pagehide", onPageHide, { once: true });
  void page.ready.catch(cause => {
    window.removeEventListener("pagehide", onPageHide);
    if (cause instanceof Error && cause.name === "AbortError") return;
    const message = document.createElement("p");
    message.setAttribute("role", "alert");
    message.textContent = cause instanceof Error ? cause.message : String(cause);
    host.append(message);
  });
}

openButton.addEventListener("click", openWorkspace);
openWorkspace();
openWorkspace();

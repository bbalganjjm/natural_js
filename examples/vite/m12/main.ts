// SPDX-License-Identifier: Apache-2.0
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageDefinition } from "@bbalganjjm/natural_js/page";
import { createRows } from "@bbalganjjm/natural_js/data";
import type { RowId, Rows } from "@bbalganjjm/natural_js/data";
import { bindDocuments, bindForm, bindNotify, openPopup } from "@bbalganjjm/natural_js/ui";
import type { PopupHandle } from "@bbalganjjm/natural_js/ui";

interface Employee {
  key: string;
  profile: { name: string };
  salary: number;
}

interface EditorInput {
  rows: Rows<Employee>;
  id: RowId;
  key: string;
  place: "main" | "document" | "popup";
  record(message: string): void;
  notify(message: string): void;
  slow?: boolean;
  fail?: boolean;
}

interface Choice { name: string }
interface ShellInput { screen: number; close(): void }

function find<E extends Element>(root: ParentNode, selector: string): E {
  const element = root.querySelector<E>(selector);
  if (!element) throw new Error(`The M12 view needs ${selector}.`);
  return element;
}

const hosts = find<HTMLElement>(document, "[data-shells]");
const shellTemplate = find<HTMLTemplateElement>(document, "template[data-shell-view]");
const editorTemplate = find<HTMLTemplateElement>(document, "template[data-editor-view]");
const addShell = find<HTMLButtonElement>(document, "[data-add-shell]");
let nextScreen = 0;
let nextController = 0;

const editor: PageDefinition<EditorInput, Choice> = {
  view: () => editorTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement,
  controller({ root, input, signal, own, output }) {
    const controller = ++nextController;
    root.dataset.controller = String(controller);
    root.dataset.place = input.place;
    root.dataset.key = input.key;
    find<HTMLElement>(root, "[data-editor-title]").textContent = `${input.place} · ${input.key}`;
    const formRoot = find<HTMLFormElement>(root, "[data-editor-form]");
    const form = bindForm(formRoot, {
      rows: input.rows,
      parse: { salary: text => Number(text.replaceAll(",", "")) }
    });
    own(() => form.dispose());
    form.bind(input.id);
    const choice = find<HTMLButtonElement>(root, "[data-use-person]");
    choice.hidden = input.place !== "popup";
    return {
      init() {
        root.dataset.lifecycle = "initializing";
        input.record(`${input.key} ${input.place} #${controller}: init`);
        formRoot.addEventListener("submit", event => {
          event.preventDefault();
          const message = form.validate().valid ? "Valid changes ready for an application save" : "Check the marked fields";
          find<HTMLOutputElement>(root, "[data-validation]").textContent = message;
          input.notify(message);
        }, { signal });
        choice.addEventListener("click", () => {
          if (form.validate().valid) output({ name: input.rows.get(input.id)!.value.profile.name });
        }, { signal });
        if (input.fail) throw new Error("The demo rejects the first initialization; open the same key to retry.");
        if (input.slow) return new Promise<void>(() => {});
      },
      activate() {
        root.dataset.lifecycle = "active";
        input.record(`${input.key} ${input.place} #${controller}: active`);
      },
      deactivate() {
        root.dataset.lifecycle = "inactive";
        input.record(`${input.key} ${input.place} #${controller}: inactive`);
      },
      dispose() {
        root.dataset.lifecycle = "disposed";
        input.record(`${input.key} ${input.place} #${controller}: disposed`);
      }
    };
  }
};

const shell: PageDefinition<ShellInput> = {
  view: () => shellTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement,
  controller({ root, input, signal, own }) {
    root.dataset.screen = String(input.screen);
    root.setAttribute("aria-label", `Application workspace ${input.screen}`);
    find<HTMLElement>(root, "[data-shell-title]").textContent = `Workspace ${input.screen}`;
    const rows = createRows<Employee>([
      { key: "ada", profile: { name: "Ada" }, salary: 1200 },
      { key: "lin", profile: { name: "Lin" }, salary: 2400 }
    ]);
    own(() => rows.dispose());
    const rowIds = new Map(rows.entries().map(row => [row.value.key, row.id]));
    const history = find<HTMLElement>(root, "[data-history]");
    function record(message: string): void {
      const item = document.createElement("li");
      item.textContent = message;
      history.append(item);
    }
    const notify = bindNotify(find<HTMLElement>(root, "[data-notify]"));
    own(() => notify.dispose());
    const documentsRoot = find<HTMLElement>(root, "[data-documents]");
    const documents = bindDocuments(documentsRoot, {
      beforeClose(key) {
        const id = rowIds.get(key);
        const changed = id !== undefined && rows.changes().some(row => row.id === id);
        const allowed = !changed || window.confirm(`Close ${key} while its shared record has unsaved changes?`);
        record(`${key}: close ${allowed ? "allowed" : "refused"}`);
        return allowed;
      }
    });
    own(() => documents.dispose());
    const dialog = find<HTMLDialogElement>(root, "[data-editor-dialog]");
    let popup: PopupHandle<Choice> | null = null;
    own(async () => { if (popup) await popup.dispose(); });
    const editorInput = (key: string, place: EditorInput["place"]): EditorInput => ({
      rows, id: rowIds.get(key) ?? rowIds.get("ada")!, key, place, record,
      notify: message => { notify.show(message); }
    });
    const main = mountPage(find<HTMLElement>(root, "[data-main-host]"), editor, editorInput("ada", "main"));
    own(() => main.dispose());
    const state = find<HTMLElement>(root, "[data-state]");
    const changedData = find<HTMLElement>(root, "[data-changes]");
    function refresh(): void {
      if (signal.aborted) return;
      state.textContent = JSON.stringify({ selected: documents.selected(), keys: documents.keys() });
      changedData.textContent = JSON.stringify(rows.changes(), null, 2);
    }
    const observer = new MutationObserver(refresh);
    observer.observe(documentsRoot, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-selected", "aria-busy"] });
    own(() => observer.disconnect());
    own(rows.subscribe(refresh));
    function run(action: Promise<unknown>, label: string): void {
      void action.then(refresh, cause => {
        if (signal.aborted || cause instanceof Error && cause.name === "AbortError") return;
        record(`${label}: failed`);
        notify.show(cause instanceof Error ? cause.message : String(cause), { urgent: true });
        refresh();
      });
    }
    let failedAttempts = 0;
    const pages = {
      ada: { title: "Ada", page: (host: HTMLElement) => mountPage(host, editor, editorInput("ada", "document")) },
      lin: { title: "Lin", page: (host: HTMLElement) => mountPage(host, editor, editorInput("lin", "document")) },
      slow: { title: "Pending", page: (host: HTMLElement) => mountPage(host, editor, { ...editorInput("slow", "document"), slow: true }) },
      retry: { title: "Retry", page: (host: HTMLElement) => mountPage(host, editor, { ...editorInput("retry", "document"), fail: failedAttempts++ === 0 }) }
    };
    async function openEditor(): Promise<void> {
      if (popup) return;
      const opened = openPopup(dialog, editor, editorInput("ada", "popup"));
      popup = opened;
      try {
        const choice = await opened.result;
        if (!signal.aborted) find<HTMLOutputElement>(root, "[data-popup-result]").textContent = choice ? `Popup used ${choice.name}` : "Popup canceled";
      } catch (cause) {
        if (!signal.aborted && !(cause instanceof Error && cause.name === "AbortError")) throw cause;
      } finally {
        if (popup === opened) popup = null;
      }
    }
    return {
      async init() {
        for (const button of root.querySelectorAll<HTMLButtonElement>("[data-open-document]")) {
          button.addEventListener("click", () => {
            const key = button.dataset.openDocument as keyof typeof pages;
            run(documents.open(key, pages[key]), `Open ${key}`);
          }, { signal });
        }
        find<HTMLButtonElement>(root, "[data-reload-document]").addEventListener("click", () => {
          const key = documents.selected();
          if (key) run(documents.reload(key), `Reload ${key}`);
        }, { signal });
        find<HTMLButtonElement>(root, "[data-close-documents]").addEventListener("click", () => {
          run((async () => {
            for (const key of documents.keys()) if (!await documents.close(key)) break;
          })(), "Close documents");
        }, { signal });
        find<HTMLButtonElement>(root, "[data-revert]").addEventListener("click", () => {
          rows.revert();
          notify.show("Shared changes reverted");
        }, { signal });
        find<HTMLButtonElement>(root, "[data-notify-normal]").addEventListener("click", () => { notify.show("Workspace notice remains until dismissed"); }, { signal });
        find<HTMLButtonElement>(root, "[data-notify-urgent]").addEventListener("click", () => { notify.show("Important workspace notice", { urgent: true }); }, { signal });
        find<HTMLButtonElement>(root, "[data-notify-clear]").addEventListener("click", () => notify.clear(), { signal });
        find<HTMLButtonElement>(root, "[data-open-popup]").addEventListener("click", event => {
          (event.currentTarget as HTMLButtonElement).focus({ preventScroll: true });
          run(openEditor(), "Popup");
        }, { signal });
        find<HTMLButtonElement>(root, "[data-remove-shell]").addEventListener("click", input.close, { signal });
        refresh();
        await main.ready;
      },
      activate() { root.dataset.lifecycle = "active"; },
      deactivate() { root.dataset.lifecycle = "inactive"; }
    };
  }
};

function openShell(): void {
  const host = document.createElement("div");
  hosts.append(host);
  const page = mountPage(host, shell, {
    screen: ++nextScreen,
    close() {
      window.removeEventListener("pagehide", onPageHide);
      void page.dispose().finally(() => { host.remove(); addShell.focus({ preventScroll: true }); });
    }
  });
  const onPageHide = () => { void page.dispose(); };
  window.addEventListener("pagehide", onPageHide, { once: true });
  void page.ready.catch(cause => {
    window.removeEventListener("pagehide", onPageHide);
    if (cause instanceof Error && cause.name === "AbortError") return;
    const error = document.createElement("p");
    error.setAttribute("role", "alert");
    error.textContent = cause instanceof Error ? cause.message : String(cause);
    host.append(error);
  });
}

addShell.addEventListener("click", openShell);
openShell();
openShell();

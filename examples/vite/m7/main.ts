// SPDX-License-Identifier: Apache-2.0
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageDefinition } from "@bbalganjjm/natural_js/page";
import { createRows } from "@bbalganjjm/natural_js/data";
import type { RowId, Rows } from "@bbalganjjm/natural_js/data";
import { bindTabs, openPopup } from "@bbalganjjm/natural_js/ui";
import type { PopupHandle } from "@bbalganjjm/natural_js/ui";

interface PickerInput {
  screen: number;
  place: "main" | "tab" | "preview" | "popup";
  slow?: boolean;
  openNested?: () => void;
  sharedRows: Rows<{ selected: string }>;
  selectedId: RowId;
}

interface PickerChoice {
  screen: number;
  person: string;
}

function find<ElementType extends Element>(root: ParentNode, selector: string): ElementType {
  const element = root.querySelector<ElementType>(selector);
  if (!element) throw new Error(`The M7 example needs ${selector}.`);
  return element;
}

const hosts = find<HTMLElement>(document, "[data-screens]");
const screenTemplate = find<HTMLTemplateElement>(document, "template[data-screen-view]");
const pickerTemplate = find<HTMLTemplateElement>(document, "template[data-picker-view]");
const sharedRows = createRows([{ selected: "None" }]);
const sharedInput = { sharedRows, selectedId: sharedRows.entries()[0]!.id };
window.addEventListener("pagehide", () => sharedRows.dispose(), { once: true });
const history = find<HTMLElement>(document, "[data-history]");
let nextScreen = 0;
let nextController = 0;

function record(message: string): void {
  const item = document.createElement("li");
  item.textContent = message;
  history.append(item);
}

function errorName(cause: unknown): string {
  return cause instanceof Error ? cause.name : String(cause);
}

const picker: PageDefinition<PickerInput, PickerChoice> = {
  view: () => pickerTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement,
  controller({ root, input, signal, own, output }) {
    root.dataset.controller = String(++nextController);
    find<HTMLElement>(root, "[data-page-heading]").textContent =
      `Screen ${input.screen} · ${input.place} picker`;
    const nested = find<HTMLButtonElement>(root, "[data-open-nested]");
    const sharedChoice = find<HTMLOutputElement>(root, "[data-shared-choice]");
    const showShared = () => {
      const selected = input.sharedRows.get(input.selectedId)?.value.selected ?? "None";
      sharedChoice.textContent = "Shared selection: " + selected;
    };
    nested.hidden = !input.openNested;
    return {
      init() {
        showShared();
        own(input.sharedRows.subscribe(showShared));
        for (const button of root.querySelectorAll<HTMLButtonElement>("[data-person]")) {
          button.addEventListener("click", () => {
            input.sharedRows.set(input.selectedId, "selected", button.dataset.person!);
            output({ screen: input.screen, person: button.dataset.person! });
          }, { signal });
        }
        if (input.openNested) {
          nested.addEventListener("click", event => {
            (event.currentTarget as HTMLButtonElement).focus({ preventScroll: true });
            input.openNested?.();
          }, { signal });
        }
        if (input.slow) return new Promise<void>(() => {});
      },
      activate() { root.dataset.lifecycle = "active"; },
      deactivate() { root.dataset.lifecycle = "inactive"; },
      dispose() { root.dataset.lifecycle = "disposed"; }
    };
  }
};

function openScreen(): void {
  const screen = screenTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
  const screenNumber = ++nextScreen;
  screen.dataset.screen = String(screenNumber);
  hosts.append(screen);
  const events = new AbortController();
  const mainOutput = find<HTMLOutputElement>(screen, "[data-main-output]");
  const tabOutput = find<HTMLOutputElement>(screen, "[data-tab-output]");
  const previewOutput = find<HTMLOutputElement>(screen, "[data-preview-output]");
  const popupOutput = find<HTMLOutputElement>(screen, "[data-popup-output]");
  const dialog = find<HTMLDialogElement>(screen, "[data-picker-dialog]");
  const plainDialog = find<HTMLDialogElement>(screen, "[data-plain-dialog]");
  let popup: PopupHandle<PickerChoice> | null = null;

  const main = mountPage(find<HTMLElement>(screen, "[data-main-host]"), picker, {
    ...sharedInput, screen: screenNumber, place: "main"
  });
  main.onOutput(choice => { mainOutput.textContent = `Main chose ${choice.person}`; });
  void main.ready.catch(cause => record(`Screen ${screenNumber}: main ${errorName(cause)}`));

  async function openPicker(slow: boolean, onChoice?: (choice: PickerChoice) => void): Promise<void> {
    if (popup) return;
    let opened: PopupHandle<PickerChoice> | undefined;
    try {
      opened = openPopup(dialog, picker, { ...sharedInput, screen: screenNumber, place: "popup", slow });
      popup = opened;
      const choice = await opened.result;
      if (choice) onChoice?.(choice);
      popupOutput.textContent = choice ? `Popup chose ${choice.person}` : "Popup canceled";
      record(`Screen ${screenNumber}: ${choice ? `picked ${choice.person}` : "canceled"}`);
    } catch (cause) {
      popupOutput.textContent = `Popup ${errorName(cause)}`;
      record(`Screen ${screenNumber}: ${errorName(cause)}`);
    } finally {
      if (popup === opened) popup = null;
    }
  }

  const tabs = bindTabs(find<HTMLElement>(screen, "[data-tabs]"), {
    initial: "people",
    pages: {
      people(host) {
        const page = mountPage(host, picker, {
          ...sharedInput, screen: screenNumber, place: "tab", openNested: () => { void openPicker(false); }
        });
        page.onOutput(choice => { tabOutput.textContent = `Tab chose ${choice.person}`; });
        return page;
      },
      preview(host) {
        const page = mountPage(find<HTMLElement>(host, "[data-preview-host]"), picker, {
          ...sharedInput, screen: screenNumber, place: "preview",
          openNested: () => { void openPicker(false, choice => {
            previewOutput.textContent = "Preview chose " + choice.person;
          }); }
        });
        page.onOutput(choice => { previewOutput.textContent = "Preview chose " + choice.person; });
        return page;
      },
      help(host) {
        const help = find<HTMLElement>(host, "[data-inline-help]");
        return mountPage(host, {
          view: help,
          controller({ root, signal }) {
            return {
              init() {
                find<HTMLButtonElement>(root, "[data-help-action]").addEventListener("click", () => {
                  tabOutput.textContent = "Help used";
                }, { signal });
              },
              activate() { root.dataset.lifecycle = "active"; },
              deactivate() { root.dataset.lifecycle = "inactive"; },
              dispose() { root.dataset.lifecycle = "disposed"; }
            };
          }
        });
      }
    }
  });
  void tabs.ready.catch(cause => record(`Screen ${screenNumber}: tabs ${errorName(cause)}`));

  find<HTMLButtonElement>(screen, "[data-open-picker]").addEventListener("click", event => {
    (event.currentTarget as HTMLButtonElement).focus({ preventScroll: true });
    void openPicker(false);
  }, { signal: events.signal });
  find<HTMLButtonElement>(screen, "[data-open-slow-picker]").addEventListener("click", event => {
    (event.currentTarget as HTMLButtonElement).focus({ preventScroll: true });
    void openPicker(true);
  }, { signal: events.signal });
  find<HTMLButtonElement>(screen, "[data-open-plain]").addEventListener("click", event => {
    (event.currentTarget as HTMLButtonElement).focus({ preventScroll: true });
    plainDialog.showModal();
  }, { signal: events.signal });
  find<HTMLButtonElement>(screen, "[data-remove-screen]").addEventListener("click", () => {
    void closeScreen();
  }, { signal: events.signal });

  async function closeScreen(): Promise<void> {
    events.abort();
    const pending = popup;
    popup = null;
    if (pending) {
      try { await pending.dispose(); } catch (cause) {
        record(`Screen ${screenNumber}: popup cleanup ${errorName(cause)}`);
      }
    }
    await Promise.allSettled([tabs.dispose(), main.dispose()]);
    screen.remove();
    record(`Screen ${screenNumber}: removed`);
  }
}

find<HTMLButtonElement>(document, "[data-add-screen]").addEventListener("click", openScreen);
openScreen();

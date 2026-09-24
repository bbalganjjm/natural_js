// SPDX-License-Identifier: Apache-2.0
import { createRows } from "@bbalganjjm/natural_js/data";
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageContext, PageHandle } from "@bbalganjjm/natural_js/page";
import { bindGrid } from "@bbalganjjm/natural_js/ui";

type Employee = {
  name: string;
  email: string;
  phone: string;
  profile: { team: string };
  shifts: { label: string; value: string }[];
  chosen: string;
};

function find<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error("Advanced Grid HTML needs " + selector);
  return element;
}

function employees(): Employee[] {
  return Array.from({ length: 40 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      name: "Employee " + number,
      email: "employee" + number + "@example.com",
      phone: "+1 555 01" + number,
      profile: { team: index % 2 ? "Support" : "Platform" },
      shifts: [{ label: "Morning", value: "morning" }, { label: "Evening", value: "evening" }],
      chosen: index % 2 ? "evening" : "morning"
    };
  });
}

function controller({ root, own, input }: PageContext<{ close(): void }>) {
  const rows = createRows(employees());
  own(() => rows.dispose());
  const table = find<HTMLTableElement>(root, "table[data-grid]");
  const selected = find<HTMLOutputElement>(root, "[data-selected]");
  const sort = find<HTMLButtonElement>(root, "[data-sort-name]");
  const header = sort.closest("th")!;
  const grid = bindGrid(table, {
    rows,
    onSelect({ row }) { selected.textContent = row ? "Selected: " + row.value.name : "No employee selected"; }
  });
  own(() => grid.dispose());

  let descending = false;
  const sortName = () => {
    descending = !descending;
    grid.setSort((a, b) => (descending ? -1 : 1) * a.name.localeCompare(b.name), {
      column: header,
      direction: descending ? "descending" : "ascending"
    });
  };
  sort.addEventListener("click", sortName);
  own(() => sort.removeEventListener("click", sortName));

  const close = find<HTMLButtonElement>(root, "[data-close]");
  close.addEventListener("click", input.close);
  own(() => close.removeEventListener("click", input.close));
  return {};
}

const hosts = find<HTMLElement>(document, "[data-hosts]");
const template = find<HTMLTemplateElement>(document, "template[data-screen]");
const openButton = find<HTMLButtonElement>(document, "[data-open]");

function open(): void {
  const host = document.createElement("div");
  host.className = "screen-host";
  hosts.append(host);
  let page: PageHandle | undefined;
  page = mountPage(host, {
    view: () => template.content.firstElementChild!.cloneNode(true) as HTMLElement,
    controller
  }, {
    close() {
      void page?.dispose().finally(() => {
        host.remove();
        openButton.focus({ preventScroll: true });
      });
    }
  });
  void page.ready.catch(cause => {
    if (cause instanceof Error && cause.name === "AbortError") return;
    const error = document.createElement("p");
    error.textContent = cause instanceof Error ? cause.message : String(cause);
    host.append(error);
  });
}

openButton.addEventListener("click", open);
open();

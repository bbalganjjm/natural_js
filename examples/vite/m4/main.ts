// SPDX-License-Identifier: Apache-2.0
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageAdvice, PageHandle } from "@bbalganjjm/natural_js/page";
import { createCommunicator } from "@bbalganjjm/natural_js/comm";
import { createEmployees } from "./employees.js";
import type { EmployeeSetup } from "./employees.js";

const hosts = document.querySelector<HTMLElement>("[data-hosts]");
const template = document.querySelector<HTMLTemplateElement>("template[data-screen]");
const openButton = document.querySelector<HTMLButtonElement>('[data-action="open"]');
if (!hosts || !template || !openButton) throw new Error("The example shell is incomplete.");
const serverView = new URL(location.href).searchParams.get("view") === "server";
const startup = createCommunicator();
const trimSearch = new URL(location.href).searchParams.get("policy") === "trim-search";
const searchAdvice: readonly PageAdvice<{ close(): void }>[] = [{
  match: (path, owner, page) => /^actions\.(?:search)$/.test(path) &&
    Object.hasOwn(owner, "search") && page.root.matches('[data-page="employees"]'),
  wrap: proceed => (...args) => {
    const query = args[0];
    if (query && typeof query === "object" && !Array.isArray(query) && "query" in query && typeof query.query === "string") {
      return proceed({ ...query, query: query.query.trim() }, ...args.slice(1));
    }
    return proceed(...args);
  }
}];

async function employeeSetup(response: Response): Promise<EmployeeSetup> {
  const value: unknown = await response.json();
  if (!value || typeof value !== "object" || !("pageSizes" in value) || !Array.isArray(value.pageSizes) ||
      !("pageSize" in value) || typeof value.pageSize !== "number" || !Number.isSafeInteger(value.pageSize) || value.pageSize <= 0) {
    throw new Error("Employee setup needs page sizes and an initial size.");
  }
  const pageSize = value.pageSize;
  const pageSizes = value.pageSizes.map((choice: unknown) => {
    if (!choice || typeof choice !== "object" || !("label" in choice) || typeof choice.label !== "string" || !choice.label.trim() ||
        !("value" in choice) || typeof choice.value !== "number" || !Number.isSafeInteger(choice.value) || choice.value <= 0) {
      throw new Error("Employee page sizes need positive values and labels.");
    }
    return { label: choice.label, value: choice.value };
  });
  if (new Set(pageSizes.map(choice => choice.value)).size !== pageSizes.length || !pageSizes.some(choice => choice.value === pageSize)) {
    throw new Error("Employee initial page size must match one unique choice.");
  }
  return { pageSizes, pageSize };
}

function open(): void {
  const host = document.createElement("div");
  host.className = "screen-host";
  hosts!.append(host);
  let page: PageHandle | undefined;
  page = mountPage(host, {
    view: serverView
      ? new URL("/m4/side-fragment.html", document.baseURI)
      : () => template!.content.firstElementChild!.cloneNode(true) as HTMLElement,
    advice: trimSearch ? searchAdvice : undefined,
    controller: context => createEmployees(context, signal => startup.request<EmployeeSetup>({
      url: new URL("./employee-setup.json", import.meta.url), signal, decode: employeeSetup
    }))
  }, {
    close() {
      void page?.dispose().finally(() => {
        host.remove();
        openButton!.focus({ preventScroll: true });
      });
    }
  });
  void page.ready.catch(cause => {
    if (cause instanceof Error && cause.name === "AbortError") return;
    const message = document.createElement("p");
    message.textContent = cause instanceof Error ? cause.message : String(cause);
    host.append(message);
  });
}

openButton.addEventListener("click", open);
open();

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
const declarationMode = new URL(location.href).searchParams.get("declarations") === "async";
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

interface EmployeeCode { readonly group: string; readonly label: string; readonly value: number }
interface EmployeeStart { readonly query: string; readonly selectedEmployee: string | null; readonly maxPageSize: number }

async function employeeCodes(response: Response): Promise<readonly EmployeeCode[]> {
  const value: unknown = await response.json();
  if (!Array.isArray(value)) throw new Error("Employee codes must be a list.");
  const keys = new Set<string>();
  return value.map((code: unknown) => {
    if (!code || typeof code !== "object" || !("group" in code) || typeof code.group !== "string" || !code.group.trim() ||
        !("label" in code) || typeof code.label !== "string" || !code.label.trim() || !("value" in code) ||
        typeof code.value !== "number" || !Number.isSafeInteger(code.value) || code.value <= 0) {
      throw new Error("Employee codes need a group, label and positive value.");
    }
    const key = JSON.stringify([code.group, code.value]);
    if (keys.has(key)) throw new Error("Employee code values must be unique in their group.");
    keys.add(key);
    return { group: code.group, label: code.label, value: code.value };
  });
}

async function employeeStart(response: Response): Promise<EmployeeStart> {
  const value: unknown = await response.json();
  if (!value || typeof value !== "object" || !("query" in value) || typeof value.query !== "string" ||
      !("selectedEmployee" in value) || value.selectedEmployee !== null && (typeof value.selectedEmployee !== "string" || !value.selectedEmployee.trim()) ||
      !("maxPageSize" in value) || typeof value.maxPageSize !== "number" || !Number.isSafeInteger(value.maxPageSize) || value.maxPageSize <= 0) {
    throw new Error("Employee start data needs a query, nullable employee and positive maximum size.");
  }
  return { query: value.query, selectedEmployee: value.selectedEmployee, maxPageSize: value.maxPageSize };
}

const requests = {
  setup(signal: AbortSignal) {
    return startup.request<EmployeeSetup>({ url: new URL("./employee-setup.json", import.meta.url), signal, decode: employeeSetup });
  },
  codes(signal: AbortSignal) {
    const url = new URL("./employee-codes.json", import.meta.url);
    url.searchParams.set("groups", "page-size");
    return startup.request<readonly EmployeeCode[]>({ url, signal, decode: employeeCodes });
  },
  start(signal: AbortSignal) {
    return startup.request<EmployeeStart>({ url: new URL("./employee-start.json", import.meta.url), signal, decode: employeeStart });
  }
};

async function prepareEmployee(signal: AbortSignal): Promise<EmployeeSetup> {
  if (!declarationMode) return await requests.setup(signal);
  const [setup, codes, start] = await Promise.all([requests.setup(signal), requests.codes(signal), requests.start(signal)]);
  signal.throwIfAborted();
  const declaration = { group: "page-size", filter: (code: EmployeeCode) => code.value <= start.maxPageSize };
  const pageSizes = codes.filter(code => code.group === declaration.group && declaration.filter(code))
    .map(code => ({ label: code.label, value: code.value }));
  if (!pageSizes.some(choice => choice.value === setup.pageSize)) throw new Error("The initial page size is unavailable after the code filter.");
  return { pageSizes, pageSize: setup.pageSize, declarations: { query: start.query, selectedEmployee: start.selectedEmployee } };
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
    controller: context => createEmployees(context, prepareEmployee)
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

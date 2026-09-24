// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { PageInput, PageRequest, PageState, PaginationHandle } from "./index.js";

const boundRoots = new WeakSet<HTMLElement>();

function pageError(code: string, message: string): FrameworkError {
  return new FrameworkError({ api: "bindPagination", code, message });
}

function normalize(input: PageInput): PageState {
  if (!input || !Number.isSafeInteger(input.page) || input.page < 1 ||
      !Number.isSafeInteger(input.size) || input.size < 1 ||
      !Number.isSafeInteger(input.total) || input.total < 0) {
    throw pageError("PAGINATION_STATE", "Page and size must be positive integers; total must be a nonnegative integer.");
  }
  const pages = Math.ceil(input.total / input.size);
  return Object.freeze({ page: Math.min(input.page, Math.max(1, pages)), size: input.size, total: input.total, pages });
}

function one(root: HTMLElement, marker: string): HTMLElement | null {
  const found = root.querySelectorAll<HTMLElement>(`[${marker}]`);
  if (found.length > 1) throw pageError("PAGINATION_MARKUP", `Use at most one ${marker} element.`);
  return found[0] ?? null;
}

export function bindPagination(root: HTMLElement, options: {
  state: PageInput;
  onPage: (request: PageRequest, event: Event) => void;
}): PaginationHandle {
  if (!(root instanceof HTMLElement)) {
    throw pageError("PAGINATION_ROOT", "The Pagination root must be an HTML element.");
  }
  if (boundRoots.has(root)) throw pageError("PAGINATION_OWNED", "This Pagination root is already bound.");
  if (typeof options?.onPage !== "function") {
    throw pageError("PAGINATION_CALLBACK", "Pagination needs an onPage callback.");
  }
  let current = normalize(options.state);
  const names = ["first", "prev", "next", "last"] as const;
  const actions = new Map<(typeof names)[number], HTMLButtonElement>();
  for (const name of names) {
    const element = one(root, `data-page-${name}`);
    if (element !== null) {
      if (!(element instanceof HTMLButtonElement)) {
        throw pageError("PAGINATION_MARKUP", `data-page-${name} needs a button.`);
      }
      actions.set(name, element);
    }
  }
  const templateElement = one(root, "data-page-template");
  if (templateElement !== null && !(templateElement instanceof HTMLButtonElement)) {
    throw pageError("PAGINATION_MARKUP", "data-page-template needs a button.");
  }
  const template = templateElement as HTMLButtonElement | null;
  if (template?.hasAttribute("id") || template?.querySelector("[id]")) {
    throw pageError("DUPLICATE_ID", "A repeated page button cannot contain a fixed DOM id.");
  }
  if (actions.size === 0 && template === null) {
    throw pageError("PAGINATION_MARKUP", "Pagination needs an authored page control or button template.");
  }
  const status = one(root, "data-page-status");
  const controls: HTMLElement[] = [...actions.values(), ...(template ? [template] : [])];
  if (new Set(controls).size !== controls.length || (status !== null && controls.includes(status))) {
    throw pageError("PAGINATION_MARKUP", "Each page marker needs its own element.");
  }
  const originalStatus = status && { text: status.textContent, live: status.getAttribute("aria-live") };
  const originalDisabled = new Map([...actions.values()].map(button => [button, button.disabled] as const));
  const anchor = root.ownerDocument.createComment("pagination pages");
  const clones = new Map<HTMLButtonElement, number>();
  let disposed = false;

  if (template) template.replaceWith(anchor);
  if (status && !status.hasAttribute("aria-live")) status.setAttribute("aria-live", "polite");
  boundRoots.add(root);

  function active(): void {
    if (disposed) throw pageError("PAGINATION_DISPOSED", "This Pagination has been disposed.");
  }

  function render(): void {
    const focused = root.ownerDocument.activeElement;
    const focusedPage = focused instanceof HTMLButtonElement ? clones.get(focused) : undefined;
    for (const button of clones.keys()) button.remove();
    clones.clear();
    const { page, pages } = current;
    for (const [name, button] of actions) {
      button.disabled = pages === 0 || ((name === "first" || name === "prev") ? page === 1 : page === pages);
    }
    if (template) {
      const first = Math.max(1, Math.min(page - 2, pages - 4));
      const last = Math.min(pages, first + 4);
      const fragment = root.ownerDocument.createDocumentFragment();
      for (let number = first; number <= last; number++) {
        const button = template.cloneNode(true) as HTMLButtonElement;
        button.removeAttribute("data-page-template");
        const numberNode = button.querySelector("[data-page-number]");
        if (numberNode) numberNode.textContent = String(number);
        else button.textContent = String(number);
        button.setAttribute("aria-label", `Page ${number}`);
        if (number === page) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
        button.disabled = false;
        clones.set(button, number);
        fragment.append(button);
      }
      anchor.after(fragment);
      if (focusedPage !== undefined) {
        const replacement = [...clones].find(([, number]) => number === focusedPage)?.[0] ??
          [...clones].find(([, number]) => number === page)?.[0];
        replacement?.focus();
      }
    }
    if (status) status.textContent = pages === 0 ? "No pages" : `Page ${page} of ${pages}`;
  }

  function request(page: number, event: Event): void {
    if (page === current.page || page < 1 || page > current.pages) return;
    options.onPage({ page, size: current.size }, event);
  }

  function onClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest("button");
    if (!(button instanceof HTMLButtonElement) || !root.contains(button) || button.disabled) return;
    const numbered = clones.get(button);
    if (numbered !== undefined) return request(numbered, event);
    for (const [name, action] of actions) {
      if (action !== button) continue;
      const page = name === "first" ? 1 : name === "prev" ? current.page - 1 :
        name === "next" ? current.page + 1 : current.pages;
      return request(page, event);
    }
  }

  render();
  root.addEventListener("click", onClick);
  return {
    state() {
      active();
      return current;
    },
    set(input) {
      active();
      current = normalize(input);
      render();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      root.removeEventListener("click", onClick);
      for (const button of clones.keys()) button.remove();
      clones.clear();
      if (template) anchor.replaceWith(template);
      for (const [button, disabled] of originalDisabled) button.disabled = disabled;
      if (status && originalStatus) {
        status.textContent = originalStatus.text;
        if (originalStatus.live === null) status.removeAttribute("aria-live");
        else status.setAttribute("aria-live", originalStatus.live);
      }
      boundRoots.delete(root);
    }
  };
}

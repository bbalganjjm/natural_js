// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";

export interface PageContext<Input = unknown, Output = unknown> {
  readonly root: HTMLElement;
  readonly input: Readonly<Input>;
  readonly signal: AbortSignal;
  own(dispose: () => void | Promise<void>): void;
  output(value: Output): void;
}

export interface PageController {
  init?(): void | Promise<void>;
  activate?(): void | Promise<void>;
  deactivate?(): void | Promise<void>;
  dispose?(): void | Promise<void>;
}

export interface PageDefinition<Input = unknown, Output = unknown> {
  view: URL | HTMLElement | (() => HTMLElement);
  controller(context: PageContext<Input, Output>): PageController;
}

export interface PageHandle<Output = unknown> {
  readonly ready: Promise<void>;
  readonly root: HTMLElement | null;
  onOutput(listener: (value: Output) => void): () => void;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  reload(): Promise<void>;
  dispose(): Promise<void>;
}

interface Instance {
  readonly abort: AbortController;
  readonly owned: Array<() => void | Promise<void>>;
  root: HTMLElement | null;
  controller: PageController | null;
  generated: boolean;
  claimed: boolean;
  active: boolean;
  activationStarted: boolean;
  cleanup?: Promise<void>;
}

const borrowedRoots = new WeakSet<HTMLElement>();

function aborted(): DOMException {
  return new DOMException("Page operation aborted", "AbortError");
}

function pageError(code: string, message: string, cause?: unknown, detail?: Record<string, unknown>): FrameworkError {
  return new FrameworkError({ code, api: "mountPage", message, cause, detail });
}

function normalize(cause: unknown, code: string): Error {
  if (cause instanceof Error && cause.name === "AbortError") return cause;
  if (cause instanceof FrameworkError) return cause;
  return pageError(code, "Page operation failed", cause);
}

async function untilAbort<Value>(signal: AbortSignal, action: () => Value | Promise<Value>): Promise<Value> {
  if (signal.aborted) throw aborted();
  let onAbort: () => void = () => {};
  const cancelled = new Promise<never>((_, reject) => {
    onAbort = () => reject(aborted());
    signal.addEventListener("abort", onAbort, { once: true });
  });
  try {
    return await Promise.race([Promise.resolve(action()), cancelled]);
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
}
function isHtmlElement(value: unknown): value is HTMLElement {
  return typeof value === "object" && value !== null &&
    (value as Node).nodeType === 1 &&
    (value as Element).namespaceURI === "http://www.w3.org/1999/xhtml";
}

function checkExecutableHtml(root: HTMLElement, url: URL): void {
  for (const element of [root, ...root.querySelectorAll<HTMLElement>("*")]) {
    if (/^(script|iframe|frame|frameset|object|embed|meta|base|portal)$/.test(element.localName)) {
      throw pageError("PAGE_HTML", "Page HTML contains an executable element", undefined,
        { element: element.localName, url: url.href });
    }
    for (const attribute of element.attributes) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.replace(/[\u0000-\u0020]/g, "").toLowerCase();
      if (name.startsWith("on") || name === "srcdoc" || value.startsWith("javascript:")) {
        throw pageError("PAGE_HTML", "Page HTML contains an executable attribute", undefined,
          { element: element.localName, attribute: name, url: url.href });
      }
    }
  }
}
function checkIds(root: HTMLElement, target: Document): void {
  const seen = new Set<string>();
  const elements = [root, ...root.querySelectorAll<HTMLElement>("[id]")];
  for (const element of elements) {
    if (!element.id) continue;
    if (seen.has(element.id)) {
      throw pageError("DUPLICATE_ID", "The page HTML repeats an id", undefined, { id: element.id });
    }
    seen.add(element.id);
  }
  for (const element of target.querySelectorAll<HTMLElement>("[id]")) {
    if (root.contains(element)) continue;
    if (seen.has(element.id)) {
      throw pageError("DUPLICATE_ID", "The page id already exists in the document", undefined, { id: element.id });
    }
  }
}

async function loadRoot(view: PageDefinition["view"], signal: AbortSignal, target: Document): Promise<HTMLElement> {
  if (view instanceof URL) {
    let response: Response;
    try {
      response = await fetch(view, { signal });
    } catch (cause) {
      throw normalize(cause, "PAGE_FETCH");
    }
    if (!response.ok) {
      throw pageError("PAGE_HTTP", "Page HTML request failed", undefined, { status: response.status, url: view.href });
    }
    const html = await response.text();
    const template = target.createElement("template");
    template.innerHTML = html;
    if (template.content.children.length !== 1 ||
        !isHtmlElement(template.content.firstElementChild)) {
      throw pageError("ROOT_MISSING", "Page HTML must contain one root element", undefined, { url: view.href });
    }
    const root = template.content.firstElementChild;
    checkExecutableHtml(root, view);
    return root;
  }
  const root = typeof view === "function" ? view() : view;
  if (!isHtmlElement(root)) {
    throw pageError("ROOT_MISSING", "Page view must provide an HTML element");
  }
  return root;
}

export function mountPage<Input = unknown, Output = unknown>(
  host: HTMLElement,
  definition: PageDefinition<Input, Output>,
  input?: Input
): PageHandle<Output> {
  let instance: Instance | null = null;
  let disposed = false;
  let generation = 0;
  const listeners = new Set<(value: Output) => void>();

  function live(current: Instance, expected: number): void {
    if (disposed || generation !== expected || current.abort.signal.aborted || instance !== current) {
      throw aborted();
    }
  }

  async function cleanup(current: Instance): Promise<void> {
    if (current.cleanup) return current.cleanup;
    current.abort.abort();
    current.cleanup = (async () => {
      let failure: unknown;
      async function run(action: (() => void | Promise<void> | undefined) | undefined): Promise<void> {
        if (!action) return;
        try { await action(); } catch (cause) { failure ??= cause; }
      }
      if (current.activationStarted) await run(() => current.controller?.deactivate?.());
      await run(() => current.controller?.dispose?.());
      for (let index = current.owned.length - 1; index >= 0; index--) {
        await run(current.owned[index]);
      }
      if (current.claimed && current.root) borrowedRoots.delete(current.root);
      if (current.generated) current.root?.remove();
      if (instance === current) instance = null;
      if (failure !== undefined) throw normalize(failure, "PAGE_DISPOSE");
    })();
    return current.cleanup;
  }

  async function start(expected: number): Promise<void> {
    if (disposed || generation !== expected) throw aborted();
    const current: Instance = {
      abort: new AbortController(), owned: [], root: null, controller: null,
      generated: !isHtmlElement(definition.view), claimed: false,
      active: false, activationStarted: false
    };
    instance = current;
    try {
      if (!isHtmlElement(host)) throw pageError("ROOT_MISSING", "Page host must be an HTML element");
      const root = await untilAbort(current.abort.signal, () => loadRoot(definition.view, current.abort.signal, host.ownerDocument));
      live(current, expected);
      current.root = root;
      if (current.generated) {
        if (root.isConnected) throw pageError("ROOT_IN_USE", "Page factory must return a detached root");
        if (host.childElementCount) throw pageError("HOST_NOT_EMPTY", "Page host must be empty");
      } else {
        if (borrowedRoots.has(root)) throw pageError("ROOT_IN_USE", "Page root is already mounted");
        if (host !== root && !host.contains(root)) {
          throw pageError("ROOT_MISSING", "Borrowed page root must be inside its host");
        }
        borrowedRoots.add(root);
        current.claimed = true;
      }
      checkIds(root, host.ownerDocument);
      if (current.generated) host.append(root);
      const context: PageContext<Input, Output> = {
        root, input: input as Readonly<Input>, signal: current.abort.signal,
        own(dispose) {
          if (!current.abort.signal.aborted && !current.cleanup) {
            current.owned.push(dispose);
            return;
          }
          try {
            void Promise.resolve(dispose()).catch(cause => {
              queueMicrotask(() => { throw pageError("PAGE_DISPOSE", "Late page cleanup failed", cause); });
            });
          } catch (cause) {
            throw pageError("PAGE_DISPOSE", "Late page cleanup failed", cause);
          }
        },
        output(value) {
          if (current.active && !current.abort.signal.aborted && instance === current) {
            for (const listener of [...listeners]) {
              if (disposed || current.abort.signal.aborted || instance !== current) break;
              if (listeners.has(listener)) listener(value);
            }
          }
        }
      };
      const controller = definition.controller(context);
      if (!controller || typeof controller !== "object") {
        throw pageError("CONTROLLER_INVALID", "Page controller must return an object");
      }
      current.controller = controller;
      await untilAbort(current.abort.signal, () => controller.init?.());
      live(current, expected);
      current.activationStarted = true;
      await untilAbort(current.abort.signal, () => controller.activate?.());
      live(current, expected);
      current.active = true;
    } catch (cause) {
      try { await cleanup(current); } catch (cleanupCause) {
        if (!(cause instanceof Error && cause.name === "AbortError")) {
          throw pageError("PAGE_DISPOSE", "Page cleanup failed after an earlier error", new AggregateError([cause, cleanupCause]));
        }
      }
      throw normalize(cause, "PAGE_INIT");
    }
  }

  const ready = start(0);
  let tail = ready.then(() => {}, () => {});
  function enqueue(action: () => Promise<void>): Promise<void> {
    const result = tail.then(action);
    tail = result.then(() => {}, () => {});
    return result;
  }

  return {
    ready,
    get root() { return instance?.root ?? null; },
    onOutput(listener) {
      if (disposed) throw aborted();
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    activate() {
      const expected = generation;
      return enqueue(async () => {
        if (disposed || generation !== expected) throw aborted();
        const current = instance;
        if (!current?.controller) throw pageError("ROOT_MISSING", "Page is not mounted");
        if (current.active) return;
        current.activationStarted = true;
        try {
          await untilAbort(current.abort.signal, () => current.controller?.activate?.());
          live(current, expected);
          current.active = true;
        } catch (cause) { throw normalize(cause, "PAGE_ACTIVATE"); }
      });
    },
    deactivate() {
      const expected = generation;
      return enqueue(async () => {
        if (disposed || generation !== expected) throw aborted();
        const current = instance;
        if (!current?.controller) throw pageError("ROOT_MISSING", "Page is not mounted");
        if (!current.active) return;
        current.active = false;
        current.activationStarted = false;
        try {
          await untilAbort(current.abort.signal, () => current.controller?.deactivate?.());
          live(current, expected);
        } catch (cause) { throw normalize(cause, "PAGE_DEACTIVATE"); }
      });
    },
    reload() {
      const expected = ++generation;
      instance?.abort.abort();
      return enqueue(async () => {
        if (disposed || generation !== expected) throw aborted();
        if (instance) await cleanup(instance);
        await start(expected);
      });
    },
    dispose() {
      if (disposed) return tail;
      disposed = true;
      generation++;
      instance?.abort.abort();
      listeners.clear();
      return enqueue(async () => { if (instance) await cleanup(instance); });
    }
  };
}
